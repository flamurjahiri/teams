import {Module} from '@nestjs/common'
import {MongooseModule} from '@nestjs/mongoose'
import {ErrorLog, ErrorLogSchema} from "./schemas/error-log.schema";
import {ErrorLogsRepository} from "./repository/error-logs.repository";
import {ErrorLogsService} from "./services/error-logs.service";
import {DEFAULT_DATABASE_CONN} from "../../assets/config.options";

@Module({
  exports: [],
  imports: [
    MongooseModule.forFeature(
      [{name: ErrorLog.name, schema: ErrorLogSchema}],
      DEFAULT_DATABASE_CONN
    )
  ],
  controllers: [],
  providers: [
    ErrorLogsRepository, ErrorLogsService
  ],
})

export class ErrorLogsModule {
}
