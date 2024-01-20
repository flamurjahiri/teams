/* eslint-disable @typescript-eslint/no-explicit-any */
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {BaseDocument} from "@teams/database";

@Schema({collection: 'Logs-Errors'})
export class ErrorLog extends BaseDocument {
  @Prop({type: Object})
  errorEntity: any
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog)
