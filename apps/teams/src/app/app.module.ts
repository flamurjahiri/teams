import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {MONGO_CONNECTION_URL, MONGO_DATABASE} from "../assets/environments";
import {SERVICE_DATABASE_CONNECTION_NAME} from "../assets/config.options";
import {MongoModule} from "@teams/database";
import {ValidationModule} from "@teams/validators";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {ScheduleModule} from "@nestjs/schedule";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ArrayResponseInterceptor} from "./providers/interceptors/array.response.interceptor";
import {RequestLoggingInterceptor} from "./providers/interceptors/request-logging.interceptor";
import {ActiveRequestsInterceptor} from "./providers/interceptors/active.requests.interceptor";
import {ProcessExceptions} from "./providers/exceptions/process.exceptions";

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_CONNECTION_URL, {
      dbName: MONGO_DATABASE,
      autoIndex: true,
      connectionName: SERVICE_DATABASE_CONNECTION_NAME
    }),
    EventEmitterModule.forRoot({global: true, wildcard: true, delimiter: '.'}),
    ScheduleModule.forRoot(),
    ValidationModule,
    MongoModule
  ],
  controllers: [],
  providers: [
    {provide: APP_INTERCEPTOR, useClass: ArrayResponseInterceptor},
    {provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor},
    {provide: APP_INTERCEPTOR, useClass: ActiveRequestsInterceptor},
    ProcessExceptions
  ],
})
export class AppModule {
}
