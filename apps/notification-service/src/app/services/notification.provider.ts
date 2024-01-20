import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {SendgridService} from "./sendgrid.service";
import {TwilioAppService} from "./twilio-app.service";
import {SendNotificationInterface} from "../entities/base/send.notification.interface";
import {NotificationType} from "../entities/base/notification.type.enum";
import {BaseNotification} from "../entities/base/base.notification.entity";
import {catchError, map, Observable, of} from "rxjs";
import {notifications} from "../generated-protos/notifications";
import ErrorReply = notifications.ErrorReply;
import Reply = notifications.Reply;

@Injectable()
export class NotificationProvider {

  @Inject(SendgridService) sendGridService: SendgridService
  @Inject(TwilioAppService) twilioService: TwilioAppService;


  private getApp(notificationType: NotificationType, context: "KAFKA" | "RPC"): SendNotificationInterface {
    if (!notificationType) {
      throw new BadRequestException("Notification type should be specified");
    }

    if (notificationType === NotificationType.VERIFICATION_CODE && context === "KAFKA") {
      throw new BadRequestException("You can't verify code using KAFKA!");
    }

    switch (notificationType) {
      case NotificationType.PHONE_MESSAGE:
      case NotificationType.SEND_VERIFICATION_CODE:
      case NotificationType.PHONE_CALL:
      case NotificationType.VERIFICATION_CODE:
        return this.twilioService;
      case NotificationType.TEMPLATE_EMAIL:
      case NotificationType.CUSTOM_EMAIL:
        return this.sendGridService;
    }
    throw new BadRequestException(`${notificationType} not supported!`);
  }


  sendKafkaNotification<T extends BaseNotification>(payload: T): Observable<boolean> {
    return this.getApp(payload.type, "KAFKA").send(payload.type, payload, true);
  }

  sendRPCNotification(payload: any): Observable<Reply> {
    return this.getApp(payload.type, "RPC").send(payload.type, payload, false).pipe(
      map(() => new Reply({success: true})),
      catchError(err =>
        of(new Reply({
          success: false, error: new ErrorReply({message: err.message, code: err.code})
        }))
      )
    );
  }

}
