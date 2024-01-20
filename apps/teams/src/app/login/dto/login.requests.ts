import {stringify} from "@teams/validators";

export class LoginRequest {
  @stringify().required()
  password: string
}
