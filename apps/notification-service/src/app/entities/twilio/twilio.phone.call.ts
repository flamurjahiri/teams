import {BaseNotification} from "../base/base.notification.entity";
import {NotificationType} from "../base/notification.type.enum";

export class TwilioPhoneCall extends BaseNotification {

  constructor() {
    super(NotificationType.PHONE_CALL);
  }

  phoneNumbers: string[];
  finishOnKey: number;
  action: string;
  actionPerformNumber: number;
  maxWaitBeforeClose: number;
  bodyMessage: string;
  performActionOnEmptyResult: boolean;
  additionalData: { key: string, value: any } [];
  method: "GET" | "POST" | "PUT" | "DELETE";

}
