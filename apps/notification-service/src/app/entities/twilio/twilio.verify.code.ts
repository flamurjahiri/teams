import {BaseNotification} from "../base/base.notification.entity";
import {NotificationType} from "../base/notification.type.enum";

export class TwilioVerifyCode extends BaseNotification{

  constructor() {
    super(NotificationType.VERIFICATION_CODE);
  }

  phoneNumber : string;
  verificationCode : string;
}
