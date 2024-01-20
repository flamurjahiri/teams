/* eslint-disable */
import {Controller, Inject, ValidationPipe} from "@nestjs/common";
import {Observable} from "rxjs";

import {GrpcMethod, Payload} from '@nestjs/microservices'
import {NotificationProvider} from "../services/notification.provider";
import {notifications} from "../generated-protos/notifications";
import {NotificationType} from "../entities/base/notification.type.enum";
import SendPhoneMessageRequest = notifications.SendPhoneMessageRequest;
import MakePhoneCallRequest = notifications.MakePhoneCallRequest;
import SendVerificationCodeRequest = notifications.SendVerificationCodeRequest;
import VerifyCodeRequest = notifications.VerifyCodeRequest;
import SendCustomEmailRequest = notifications.SendCustomEmailRequest;
import SendTemplateEmailRequest = notifications.SendTemplateEmailRequest;

@Controller()
export class GrpcNotificationController {

  @Inject(NotificationProvider) notificationProvider: NotificationProvider

  @GrpcMethod('NotificationService', 'sendPhoneMessage')
  sendPhoneMessage(@Payload(new ValidationPipe({whitelist: true})) request: any): Observable<any> {
    const req = SendPhoneMessageRequest.fromObject(request);
    return this.notificationProvider.sendRPCNotification({
      ...req,
      additionalData: (req.additionalData || []).map(r => ({key: r.key, value: JSON.parse(r.stringifyValue)})),
      type: NotificationType.PHONE_MESSAGE
    });
  }

  @GrpcMethod('NotificationService', 'makePhoneCalls')
  makePhoneCall(@Payload(new ValidationPipe({whitelist: true})) request: any): Observable<any> {
    const req = MakePhoneCallRequest.fromObject(request);
    return this.notificationProvider.sendRPCNotification({
      ...req,
      additionalData: (req.additionalData || []).map(r => ({key: r.key, value: JSON.parse(r.stringifyValue)})),
      type: NotificationType.PHONE_CALL
    });
  }

  @GrpcMethod('NotificationService', 'sendVerificationCode')
  sendVerificationCode(@Payload(new ValidationPipe({whitelist: true})) request: any): Observable<any> {
    const req = SendVerificationCodeRequest.fromObject(request);
    return this.notificationProvider.sendRPCNotification({...req, type: NotificationType.SEND_VERIFICATION_CODE});
  }

  @GrpcMethod('NotificationService', 'verifyCode')
  verifyCode(@Payload(new ValidationPipe({whitelist: true})) request: any): Observable<any> {
    const req = VerifyCodeRequest.fromObject(request);
    return this.notificationProvider.sendRPCNotification({...req, type: NotificationType.VERIFICATION_CODE});
  }


  @GrpcMethod('NotificationService', 'sendCustomEmail')
  sendCustomEmail(@Payload(new ValidationPipe({whitelist: true})) request: any): Observable<any> {
    const req = SendCustomEmailRequest.fromObject(request);
    return this.notificationProvider.sendRPCNotification({...req, type: NotificationType.CUSTOM_EMAIL});
  }

  @GrpcMethod('NotificationService', 'sendTemplateEmails')
  sendTemplateEmailEmail(@Payload(new ValidationPipe({whitelist: true})) request: any): Observable<any> {
    const req = SendTemplateEmailRequest.fromObject(request);
    return this.notificationProvider.sendRPCNotification({
      ...req,
      additionalData: (req.additionalData || []).map(r => ({key: r.key, value: JSON.parse(r.stringifyValue)})),
      type: NotificationType.TEMPLATE_EMAIL
    });
  }

}
