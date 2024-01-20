import {Global, Module} from '@nestjs/common'
import {JoiValidationPipe} from "./entities/joi.validation.pipe.service";

@Global()
@Module({
  exports: [JoiValidationPipe],
  providers: [JoiValidationPipe]
})
export class ValidationModule {
}
