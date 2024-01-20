import {NotificationType} from "./notification.type.enum";

export class BaseNotification {
  type: NotificationType


  constructor(type: NotificationType) {
    this.type = type;
  }
}
