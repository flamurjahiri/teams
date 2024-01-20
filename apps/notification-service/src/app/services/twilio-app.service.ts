/* eslint-disable */
import {BadRequestException, Injectable} from "@nestjs/common";
import {SendNotificationInterface} from "../entities/base/send.notification.interface";
import {NotificationType} from "../entities/base/notification.type.enum";
import {catchError, from, iif, map, mergeMap, Observable, of, reduce, throwError} from "rxjs";
import {BaseNotification} from "../entities/base/base.notification.entity";
import {TwilioPhoneCall} from "../entities/twilio/twilio.phone.call";
import {TwilioTextMessage} from "../entities/twilio/twilio.text.message";
import {TwilioVerificationCodeRequest} from "../entities/twilio/twilio.verification.code.request";
import {TwilioVerifyCode} from "../entities/twilio/twilio.verify.code";
import {TwilioService} from 'nestjs-twilio';
import {TWILIO_PHONE_NUMBER, TWILIO_SERVICE_SID} from "../../assets/environments";
import {fromPromise} from "@teams/utils";

const VoiceResponse = require('twilio').twiml.VoiceResponse;

@Injectable()
export class TwilioAppService extends SendNotificationInterface {

  constructor(private readonly twilioService: TwilioService) {
    super();
  }

  serviceName(): string {
    return "Twilio";
  }

  supportedNotificationType(): string {
    return `${NotificationType.VERIFICATION_CODE}, ${NotificationType.SEND_VERIFICATION_CODE}, ${NotificationType.PHONE_CALL}, ${NotificationType.PHONE_MESSAGE}`;
  }

  send<T extends BaseNotification>(notificationType: NotificationType, payload: T, fail: boolean): Observable<boolean> {

    switch (notificationType) {
      case NotificationType.PHONE_CALL: {
        return this.makePhoneCalls(payload as unknown as TwilioPhoneCall, fail);
      }

      case NotificationType.PHONE_MESSAGE: {
        return this.sendPhoneMessage(payload as unknown as TwilioTextMessage, fail);
      }

      case NotificationType.VERIFICATION_CODE: {
        return this.verifyCode(payload as unknown as TwilioVerifyCode, fail);
      }

      case NotificationType.SEND_VERIFICATION_CODE: {
        return this.sendVerificationCode(payload as unknown as TwilioVerificationCodeRequest, fail);
      }
    }

    return throwError(() => new BadRequestException(`${notificationType} not supported`));
  }


  private makePhoneCalls(payload: TwilioPhoneCall, fail: boolean): Observable<boolean> {
    if (!payload.phoneNumbers?.length) {
      return of(true);
    }


    const response = new VoiceResponse();
    response.say(payload.bodyMessage);
    response.gather({
      action: payload.action,
      method: payload.method,
      actionOnEmptyResult: payload.performActionOnEmptyResult,
      finishOnKey: payload.finishOnKey,
    });
    response.pause({length: payload.maxWaitBeforeClose});


    const sendPhoneCallPayload = {from: TWILIO_PHONE_NUMBER, method: payload.method, twiml: response};


    return from(payload.phoneNumbers).pipe(
      mergeMap(to => fromPromise(
        this.twilioService.client.calls.create({to, ...sendPhoneCallPayload})
      )),
      map(_ => true),
      catchError(err => iif(() => fail, throwError(err), of(false))),
      reduce((a, v) => a && v, true)
    );
  }

  private sendPhoneMessage(payload: TwilioTextMessage, fail: boolean): Observable<boolean> {
    if (!payload?.phoneNumbers.length) {
      return of(true);
    }


    return from(payload.phoneNumbers).pipe(
      mergeMap(to => fromPromise(
        this.twilioService.client.messages.create({body: payload.body, from: TWILIO_PHONE_NUMBER, to})
      )),
      map(_ => true),
      catchError(err => iif(() => fail, throwError(err), of(false))),
      reduce((a, v) => a && v, true)
    );
  }

  private verifyCode(payload: TwilioVerifyCode, fail: boolean): Observable<boolean> {
    if (!payload?.phoneNumber || !payload?.verificationCode) {
      return of(true);
    }

    return fromPromise(
      this.twilioService.client.verify.v2.services(TWILIO_SERVICE_SID).verificationChecks.create({
        to: payload.phoneNumber,
        code: payload.verificationCode
      })).pipe(
      map(d => d.status === "approved"),
      catchError(err => iif(() => fail, throwError(err), of(false)))
    );
  }

  private sendVerificationCode(payload: TwilioVerificationCodeRequest, fail: boolean): Observable<boolean> {
    if (!payload?.to) {
      return of(true);
    }
    return fromPromise(
      this.twilioService.client.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
        to: payload.to,
        channel: 'sms'
      })
    ).pipe(
      map(_ => true),
      catchError(err => iif(() => fail, throwError(err), of(false)))
    );
  }
}
