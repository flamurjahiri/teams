import {BadRequestException, Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import Stripe from 'stripe';
import {catchError, combineLatest, lastValueFrom, mergeMap, Observable, of, retry, tap, throwError, timer} from "rxjs";
import {fromPromise} from "@teams/utils";
import {ClientKafka, ClientProxyFactory} from "@nestjs/microservices";
import {KAFKA_OPTIONS} from "../assets/configs";
import {KafkaJSNonRetriableError} from "kafkajs";
import {Payment} from "./payment.entity";
import {EventEmitter2, OnEvent} from "@nestjs/event-emitter";

@Injectable()
export class PaymentService implements OnModuleInit, OnModuleDestroy {

  @Inject(EventEmitter2) emitter: EventEmitter2

  private readonly stripe: { [k: string]: Stripe };

  private readonly client: ClientKafka

  constructor() {
    //process.env.STRIPE_OPTIONS format : [{\"name\" : \"name\" , \"apiKey\" : \"123\"}]"
    const options: [{ name: string, apiKey: string }] = JSON.parse(process.env.STRIPE_OPTIONS || '[{}]') as [{
      name: string,
      apiKey: string
    }];

    this.stripe = options?.reduce((a, v) => {
      a[v.name] = new Stripe(v.apiKey, {});
      Logger.log(`🚀 Stripe ${v.name} successfully started 🚀`);
      return a;
    }, {});


    this.client = ClientProxyFactory.create(KAFKA_OPTIONS) as ClientKafka;
  }

  async onModuleInit(): Promise<any> {
    return this.client.connect();
  }

  onModuleDestroy(): Promise<any> {
    return this.client.close();
  }


  makePayment(payment: Payment): Observable<any> {
    return this.pay(payment).pipe(
      tap({
        next: () => this.emitter.emit('payment-success', payment),
        error: (err) => this.emitter.emit('payment-failed', {payment, err})
      }),
      catchError(err => {
        Logger.error(`Failed to send money : ${payment.log} with error : ${err}`);
        if (err?.code === 404) {
          return of(false);
        }
        return throwError(err);
      })
    )
  }

  private pay(payment: Payment): Observable<any> {

    if (!this.stripe[payment.name]) {
      return throwError(() => new BadRequestException(`This app is not supported for payment`));
    }

    const stripe: Stripe = this.stripe[payment.name];

    const card = {number: payment.number, cvc: payment.cvc, exp_month: payment.exp_month, exp_year: payment.exp_year};

    //THIS HAS NOT BEEN TESTED DUE TO CREDENTIALS
    return fromPromise(stripe.paymentMethods.create({type: "card", card})).pipe(
      mergeMap(paymentMethod =>
        combineLatest([
          of(paymentMethod),
          fromPromise(stripe.paymentIntents.create({
            amount: payment.amount,
            currency: payment.currency,
            payment_method: paymentMethod.id
          }))
        ])
      ),
      mergeMap(([paymentMethod, paymentIntents]) =>
        fromPromise(stripe.paymentIntents.confirm(paymentIntents.id, {payment_method: paymentMethod.id}))
      ),
      retry({
        count: 10,
        delay: (error, retryCount) => {
          if (error?.code === 404 || retryCount === 10) {
            return throwError(error);
          }

          return timer(1000 * retryCount);
        }
      }));
  }


  @OnEvent('payment-success', {async: true})
  private onSuccess(payment: Payment): Promise<any> {
    const data = {
      success: true,
      id: payment.id,
      name: payment.name
    };

    return lastValueFrom(this.sendKafkaData(data, payment.onSuccessPushTo));
  }


  @OnEvent('payment-failed', {async: true})
  private sendNotification(data: { payment: Payment, err: any }): Promise<any> {
    if (data.err?.code === 404) {
      return Promise.resolve(false);
    }

    const emailData = {
      emails: [data.payment.email],
      subject: data.payment.log,
      from: {
        name: data.payment.name,
        email: `do-not-reply@${data.payment.name}.com`
      },
      templateId: process.env.TEMPLATE_ID,
      type: 'TEMPLATE_EMAIL'
    };

    return lastValueFrom(this.sendKafkaData(emailData, 'notifications-data'));
  }


  private sendKafkaData(data: any, topic: any): Observable<any> {
    return this.client.emit(topic, data).pipe(
      retry({
        count: 5, delay: (err, retryCount) => {
          if ((err?.name === "KafkaJSError" && err?.message === "The producer is disconnected") || err instanceof KafkaJSNonRetriableError) {
            return fromPromise(this.client.connect());
          }
          return timer(retryCount * 1000);
        }
      }));
  }
}
