import {BaseNotification} from "../base/base.notification.entity";
import {NotificationType} from "../base/notification.type.enum";
import {From} from "./email.from";

export class SendgridTemplateEmailRequest extends BaseNotification {
  constructor() {
    super(NotificationType.TEMPLATE_EMAIL);
  }

  emails: string[];
  subject: string;
  emailContact: From;
  additionalData: { key: string, value: any } []
  from: From
  templateId: string
}
