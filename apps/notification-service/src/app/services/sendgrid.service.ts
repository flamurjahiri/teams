/* eslint-disable */
import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {SendNotificationInterface} from "../entities/base/send.notification.interface";
import {BaseNotification} from "../entities/base/base.notification.entity";
import {NotificationType} from "../entities/base/notification.type.enum";
import {catchError, iif, map, Observable, of, throwError} from "rxjs";
import {SendgridCustomEmailRequest} from "../entities/sendgrid/sendgrid.custom.email.request";
import {SendgridTemplateEmailRequest} from "../entities/sendgrid/sendgrid.template.email.request";
import {HttpService} from "@nestjs/axios";
import {SENDGRID_API_KEY, SENDGRID_DEFAULT_EMAIL, SENDGRID_DEFAULT_NAME, SENDGRID_URL} from "../../assets/environments";

@Injectable()
export class SendgridService extends SendNotificationInterface {

  @Inject(HttpService) httpService: HttpService

  serviceName(): string {
    return "Sendgrid";
  }

  supportedNotificationType(): string {
    return `${NotificationType.CUSTOM_EMAIL}, ${NotificationType.TEMPLATE_EMAIL}`;
  }

  send<T extends BaseNotification>(notificationType: NotificationType, payload: T, fail: boolean): Observable<boolean> {

    switch (notificationType) {
      case NotificationType.CUSTOM_EMAIL: {
        return this.sendCustomEmail(payload as unknown as SendgridCustomEmailRequest, fail);
      }

      case NotificationType.TEMPLATE_EMAIL: {
        return this.sendTemplateEmail(payload as unknown as SendgridTemplateEmailRequest, fail);
      }
    }

    return throwError(() => new BadRequestException(`${notificationType} not supported`));
  }


  private sendCustomEmail(payload: SendgridCustomEmailRequest, fail: boolean): Observable<boolean> {
    if (!payload?.emails?.length) {
      return of(true);
    }


    const data = {
      personalizations: payload.emails.map(email => ({to: [{email}]})),
      email: payload.from || {email: SENDGRID_DEFAULT_EMAIL, name: SENDGRID_DEFAULT_NAME},
      subject: payload.content.subject.replace("\n", ""),
      content: [{
        type: "text/html",
        value: payload.content.body
      }]
    };


    return this.httpService.post(SENDGRID_URL, data, headers()).pipe(
      map(_ => true),
      catchError(err => iif(() => fail, throwError(err), of(false)))
    );
  }

  private sendTemplateEmail(payload: SendgridTemplateEmailRequest, fail: boolean): Observable<boolean> {
    if (!payload.templateId || !payload?.emails?.length) {
      return of(true);
    }

    const data = {
      email: payload.from || {email: SENDGRID_DEFAULT_EMAIL, name: SENDGRID_DEFAULT_NAME},
      template_id: payload.templateId,
      personalizations: [
        {
          to: payload.emails.map(email => ({email})),
          dynamic_template_data: (payload.additionalData || []).reduce((a, v) => a.set(v.key, v.value), new Map<string, any>)
        }
      ]
    };

    return this.httpService.post(SENDGRID_URL, data, headers()).pipe(
      map(_ => true),
      catchError(err => iif(() => fail, throwError(err), of(false)))
    );
  }
}


const headers = () => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: SENDGRID_API_KEY
  }
})
