/* eslint-disable @typescript-eslint/no-explicit-any */
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {BaseDocument} from "@teams/database";

@Schema({collection: 'Error-Logs'})
export class ErrorLog extends BaseDocument {
  @Prop({type: Object})
  errorEntity: any
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog)
