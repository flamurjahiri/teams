/* eslint-disable */
import {BadRequestException, Inject, Injectable, Logger} from "@nestjs/common";
import {RPCClient} from "@teams/rpc";
import {NOTIFICATION_SERVICE} from "../../../assets/config.options";
import {notifications} from "../../protos/notifications";
import {OnEvent} from "@nestjs/event-emitter";
import {User} from "../../users/entities/users.schema";
import {catchError, from, iif, lastValueFrom, mergeMap, of, takeWhile, tap, throwError} from "rxjs";
import {EMAIL_FROM, EMAIL_NAME, EMAIL_TEMPLATE_ID, SERVICE_URL} from "../../../assets/environments";
import {ValidateType} from "../../users/dto/validate.users.data";
import {NotificationsRepository} from "../repository/notifications.repository";
import {DeleteResult, UpdateResult} from "@teams/database";
import {Cron, CronExpression} from "@nestjs/schedule";
import {Notification} from "../entities/notifications.schema";

@Injectable()
export class NotificationHandlerService {
  //region injections
  @Inject(NotificationsRepository) private readonly repo: NotificationsRepository

  @RPCClient({options: NOTIFICATION_SERVICE, name: 'NotificationService'})
  private notificationService: notifications.NotificationService;

  //endregion

  //region phone notifications
  @OnEvent('create-user', {async: true})
  sendPhoneNotificationsOnCreate(user: User): Promise<UpdateResult | DeleteResult> {
    return this.sendPhoneOnCreate(user, false);
  }

  sendPhoneOnCreate(user: User, isRetry: boolean): Promise<UpdateResult | DeleteResult> {
    const notification = {
      userId: user._id,
      type: "PHONE",
      phoneNumber: user.phoneNumber,
      email: user.email
    };

    return lastValueFrom(
      iif(() => isRetry, of(true), this.repo.insertOne(notification)).pipe(
        mergeMap(_ => this.notificationService.sendVerificationCode({to: user.phoneNumber})),
        mergeMap(r => iif(() => r.success, of(true), throwError(() => new BadRequestException(r.error?.message)))),
        tap({error: (err) => Logger.log(`Failed to send phone notification with error : ${err}`)}),
        mergeMap(_ => this.repo.deleteByType(user._id, "PHONE")),
        catchError(_ => iif(() => isRetry, of(new UpdateResult()), this.repo.markAsFailed(user._id, "PHONE")))
      )
    );
  }

  //endregion

  //region email notifications
  @OnEvent('create-user', {async: true})
  sendEmailNotifications(user: User): Promise<UpdateResult | DeleteResult> {
    return this.sendEmailNotificationOnCreate(user, false);
  }

  sendEmailNotificationOnCreate(user: User, isRetry: boolean): Promise<UpdateResult | DeleteResult> {
    const templateEmailPayload = {
      emails: [user.email],
      from: {name: EMAIL_NAME || "X", email: EMAIL_FROM || "X"},
      templateId: EMAIL_TEMPLATE_ID,
      subject: "Please verify your data",
      additionalData: [
        {
          key: "URL",
          stringifyValue: `${SERVICE_URL}/teams/api/users/${user._id}/validate/${ValidateType.EMAIL.valueOf()}`
        },
        {
          key: "name",
          stringifyValue: `${user.firstName} ${user.lastName}`
        }]
    };

    const notification = {
      userId: user._id,
      type: "PHONE",
      phoneNumber: user.phoneNumber,
      email: user.email
    };

    return lastValueFrom(
      iif(() => isRetry, of(true), this.repo.insertOne(notification)).pipe(
        mergeMap(_ => this.notificationService.sendTemplateEmails(templateEmailPayload)),
        mergeMap(r => iif(() => r.success, of(true), throwError(() => new BadRequestException(r.error?.message)))),
        tap({error: (err) => Logger.log(`Failed to send template notification with error : ${err}`)}),
        mergeMap(_ => this.repo.deleteByType(user._id, "EMAIL")),
        catchError(_ => iif(() => isRetry, of(new UpdateResult()), this.repo.markAsFailed(user._id, "EMAIL")))
      )
    );
  }

  //endregion

  //region cron
  @Cron(CronExpression.EVERY_5_MINUTES)
  sendFailedNotifications() {
    const userFromNotification = (i: Notification) => ({
      _id: i.userId,
      phoneNumber: i.phoneNumber,
      email: i.email
    }) as unknown as User;

    return this.repo.getFailed().pipe(
      takeWhile(i => i?.length > 0),
      mergeMap(r => from(r)),
      mergeMap(i => iif(() => i.type === "EMAIL",
        this.sendEmailNotificationOnCreate(userFromNotification(i), true),
        this.sendPhoneOnCreate(userFromNotification(i), true))
      ),
    ).subscribe({error: (err) => Logger.error(`Failed to send failed notifications : ${err.message}`)});
  }

  //endregion
}
