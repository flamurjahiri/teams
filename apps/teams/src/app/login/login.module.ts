import {Module} from '@nestjs/common'
import {LoginService} from "./services/login.service";
import {LoginController} from "./controllers/login.controller";
import {UserModule} from "../users/user.module";

@Module({
  exports: [],
  imports: [
    UserModule
  ],
  controllers: [LoginController],
  providers: [LoginService],
})

export class LoginModule {
}
