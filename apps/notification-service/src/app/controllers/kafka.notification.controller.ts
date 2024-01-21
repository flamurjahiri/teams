import {Controller, Inject} from "@nestjs/common";

import {EventPattern, Payload} from '@nestjs/microservices'
import {NotificationProvider} from "../services/notification.provider";

@Controller()
export class KafkaNotificationController {

  @Inject(NotificationProvider) notificationProvider: NotificationProvider

  @EventPattern(`notifications-data`)
  sensorData(@Payload() message: any) {
    return this.notificationProvider.sendKafkaNotification(message);
  }

}
