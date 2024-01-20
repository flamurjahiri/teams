import {date,} from 'joiful';
import {Prop} from "@nestjs/mongoose";
import {ObjectId} from "mongodb";

export class BaseDocument {
  @Prop({type: () => String, default: new ObjectId().toHexString()})
  _id?: string

  @Prop({type: Date, default: Date.now}) @date().default(Date.now())
  createdAt?: Date

  @Prop({type: Date, default: Date.now}) @date().default(Date.now())
  updatedAt?: Date
}
