import {Observable} from "rxjs";
import {NotificationType} from "./notification.type.enum";
import {BaseNotification} from "./base.notification.entity";
import {Logger, OnModuleInit} from "@nestjs/common";

export abstract class SendNotificationInterface implements OnModuleInit {
  onModuleInit(): any {
    Logger.log(`🚀 ${this.serviceName()} is online and is handling those kind of requests : ${this.supportedNotificationType()} 🚀`)
  }


  abstract serviceName(): string;

  abstract supportedNotificationType(): string;

  abstract send<T extends BaseNotification>(notificationType: NotificationType, payload: T, fail: boolean): Observable<boolean>
}
