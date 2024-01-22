import {stringify} from "@teams/validators";
import {number, string} from "joiful";

export class Payment {
  @stringify().required()
  id: string

  @stringify().required()
  name: string;

  @string().creditCard().required()
  number: string;

  @string().max(3).min(3).required()
  cvc: string;

  @number().required()
  exp_month: number;

  @number().required()
  exp_year: number;

  @number().required()
  amount: number

  @stringify().required()
  currency: string

  @string().email({tlds: {allow: false}}).required()
  email: string

  @string().required()
  log: string

  @stringify().required()
  onSuccessPushTo: string
}
