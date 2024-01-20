import {BaseNotification} from "../base/base.notification.entity";
import {NotificationType} from "../base/notification.type.enum";

export class TwilioVerificationCodeRequest extends BaseNotification {

  constructor() {
    super(NotificationType.SEND_VERIFICATION_CODE);
  }

  to: string;
}
