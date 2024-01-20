import {Global, Module} from "@nestjs/common";
import {MongoUtils} from "./services/mongo-utils.service";

@Global()
@Module({
  exports: [MongoUtils],
  imports: [],
  controllers: [],
  providers: [MongoUtils],
})
export class MongoModule {
}
