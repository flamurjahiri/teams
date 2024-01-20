import {Module} from '@nestjs/common';

import {TwilioModule} from "nestjs-twilio";
import {SendgridService} from "./services/sendgrid.service";
import {TwilioAppService} from "./services/twilio-app.service";
import {HttpModule} from "@nestjs/axios";
import {NotificationProvider} from "./services/notification.provider";
import {KafkaNotificationController} from "./controllers/kafka.notification.controller";
import {GrpcNotificationController} from "./controllers/grpc.notification.controller";
import {HealthController} from "./health.controller";
import {TerminusModule} from "@nestjs/terminus";

@Module({
  imports: [
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID || "AClocalhost",
      authToken: process.env.TWILIO_AUTH_TOKEN || "localhost",
    }),
    HttpModule,
    TerminusModule
  ],
  controllers: [KafkaNotificationController, GrpcNotificationController, HealthController],
  providers: [SendgridService, TwilioAppService, NotificationProvider],
})
export class AppModule {
}
