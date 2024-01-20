import {enumerate, stringify} from "@teams/validators";

export enum ValidateType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL'
}

export class ValidateUsersData {
  @enumerate(ValidateType).required()
  type: ValidateType;

  @stringify().required()
  id: string
}

export class CodeRequest {
  @stringify().optional()
  code : string
}
