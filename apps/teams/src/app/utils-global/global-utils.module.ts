import {Global, Module} from '@nestjs/common'
import {PasswordValidationService} from "./services/password.validation.service";

@Global()
@Module({
  exports: [PasswordValidationService],
  imports: [],
  controllers: [],
  providers: [PasswordValidationService],
})

export class GlobalUtilsModule {
}
