import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {MONGO_CONNECTION_URL, MONGO_DATABASE} from "../assets/environments";
import {SERVICE_DATABASE_CONNECTION_NAME} from "../assets/config.options";
import {MongoModule} from "@teams/database";
import {ValidationModule} from "@teams/validators";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {ScheduleModule} from "@nestjs/schedule";

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
  providers: [],
})
export class AppModule {
}
