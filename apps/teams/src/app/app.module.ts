import {Module} from '@nestjs/common';
import {MongoModule} from "@teams/database";
import {ValidationModule} from "@teams/validators";

@Module({
  imports: [MongoModule, ValidationModule],
  controllers: [],
  providers: [],
})
export class AppModule {
}
