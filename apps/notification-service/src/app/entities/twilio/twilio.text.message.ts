import {BaseNotification} from "../base/base.notification.entity";
import {NotificationType} from "../base/notification.type.enum";

export class TwilioTextMessage extends BaseNotification {
  constructor() {
    super(NotificationType.PHONE_MESSAGE);
  }

  phoneNumbers: string[];
  body: string;
  additionalData: { key: string, value: any } []
}
