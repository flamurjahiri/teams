import {EmailContent} from "./email.content";
import {BaseNotification} from "../base/base.notification.entity";
import {NotificationType} from "../base/notification.type.enum";
import {From} from "./email.from";

export class SendgridCustomEmailRequest extends BaseNotification {
  constructor() {
    super(NotificationType.CUSTOM_EMAIL);
  }

  emails: string[];
  content: EmailContent;
  from: From
}



