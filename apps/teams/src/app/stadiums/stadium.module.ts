import {Module} from '@nestjs/common'
import {MongooseModule} from '@nestjs/mongoose'
import {DEFAULT_DATABASE_CONN} from "../../assets/config.options";
import {Stadium, StadiumSchema} from "./entities/stadium.schema";
import {StadiumService} from "./services/stadium.service";
import {StadiumRepository} from "./repository/stadium.repository";

@Module({
  exports: [],
  imports: [
    MongooseModule.forFeature(
      [
        {name: Stadium.name, schema: StadiumSchema}
      ],
      DEFAULT_DATABASE_CONN
    )
  ],
  controllers: [],
  providers: [StadiumService, StadiumRepository],
})

export class StadiumModule {
}
