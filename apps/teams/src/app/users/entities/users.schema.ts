import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {BaseDocument} from "@teams/database";
import {boolean, date, object, string} from "joiful";
import {stringify} from "@teams/validators";
import {BadRequestException} from "@nestjs/common";
import {UserValidatedData} from "./user.validated.data";

@Schema({collection: 'Logs-Errors'})
export class User extends BaseDocument {
  @Prop() @stringify().required()
  firstName: string

  @Prop() @stringify().required()
  lastName: string

  @Prop({index: {unique: true}}) @string().min(8).required()
  username: string

  @Prop() @string().email({tlds: {allow: false}})
  email: string

  @Prop() @boolean().default(false).optional()
  disabled: boolean

  @Prop() @string().regex(/^\+?\d{10,15}$/).required()
  phoneNumber: string

  @Prop() @string().required()
  password: string

  @Prop({type: () => UserValidatedData}) @object().default({email: false, phoneNumber: false}).optional()
  validated: UserValidatedData

  @Prop({type: Date, default: Date.now, index: {expireAfterSeconds: 1200}}) @date().default(Date.now())
  expiresAt?: Date
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({phoneNumber: 1}, {
  unique: true,
  partialFilterExpression: {'validated.phoneNumber': true}
});


UserSchema.index({email: 1}, {
  unique: true,
  partialFilterExpression: {'validated.email': true}
});

UserSchema.index({expiresAt: 1}, {
  expireAfterSeconds: 1200,
  partialFilterExpression: {expiresAt: {$exists: true}}
});


UserSchema.post('save', function (error, doc, next) {
  if (error.code === 11000 && error.codeName === "DuplicateKey") {
    next(new BadRequestException("This email or phone number already exists"));
  } else {
    next(error);
  }
})
