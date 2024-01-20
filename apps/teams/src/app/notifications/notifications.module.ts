import {Module} from '@nestjs/common'
import {MongooseModule} from '@nestjs/mongoose'
import {DEFAULT_DATABASE_CONN} from "../../assets/config.options";
import {NotificationHandlerService} from "./services/notification-handler.service";
import {NotificationsRepository} from "./repository/notifications.repository";
import {Notification, NotificationsSchema} from "./entities/notifications.schema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {name: Notification.name, schema: NotificationsSchema}
      ],
      DEFAULT_DATABASE_CONN
    )
  ],
  controllers: [],
  providers: [
    NotificationHandlerService, NotificationsRepository
  ],
})

export class NotificationsModule {
}
