import {Module} from '@nestjs/common'
import {MongooseModule} from '@nestjs/mongoose'
import {DEFAULT_DATABASE_CONN} from "../../assets/config.options";
import {UserService} from "./services/user.service";
import {PasswordValidationService} from "../utils-global/services/password.validation.service";
import {UserController} from "./controllers/user.controller";
import {User, UserSchema} from "./entities/users.schema";
import {UserRepository} from "./repository/user.repository";

@Module({
  exports: [UserService],
  imports: [
    MongooseModule.forFeature(
      [
        {name: User.name, schema: UserSchema}
      ],
      DEFAULT_DATABASE_CONN
    )
  ],
  controllers: [UserController],
  providers: [UserService, PasswordValidationService, UserRepository],
})

export class UserModule {
}
