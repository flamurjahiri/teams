import {BaseDocument} from "@teams/database";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {stringify} from "@teams/validators";
import {UserSimple} from "../../users/dto/user.simple";
import {UserSchema} from "../../users/entities/users.schema";
import {BadRequestException} from "@nestjs/common";
import {array, number} from "joiful";
import {WorkingDays} from "./working.days.enum";

@Schema({collection: 'Stadium'})
export class Stadium extends BaseDocument {
  @Prop() @stringify().empty(null).required()
  name: string;

  @Prop({type: () => UserSimple})
  createdBy: UserSimple

  @Prop() @stringify().required()
  city: string

  @Prop() @stringify().required()
  country: string

  @Prop() @array().required()
  phoneNumbers: string[]

  @Prop() @number().required()
  openAt: number

  @Prop() @number().required()
  closesAt: number

  @Prop() @array().required()
  workingDays: WorkingDays[]

  @Prop() @stringify().required()
  address: string
}


export const StadiumSchema = SchemaFactory.createForClass(Stadium);

StadiumSchema.index({name: 1, city: 1, 'createdBy._id': 1}, {unique: true});

UserSchema.post('save', function (error, doc, next) {
  if (error.code === 11000 && error.codeName === "DuplicateKey") {
    next(new BadRequestException("This stadium is already created!"));
  } else {
    next(error);
  }
})
