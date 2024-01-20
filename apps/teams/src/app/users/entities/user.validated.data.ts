import {Prop} from "@nestjs/mongoose";
import {boolean} from "joiful";

export class UserValidatedData {

  @Prop() @boolean().default(false).optional()
  email: boolean

  @Prop() @boolean().default(false).optional()
  phoneNumber: boolean

}
