/* eslint-disable @typescript-eslint/no-explicit-any */
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {BaseDocument} from "@teams/database";

@Schema({collection: 'Notifications'})
export class Notification extends BaseDocument {
  @Prop()
  userId: string

  @Prop()
  type: string

  @Prop()
  phoneNumber: string

  @Prop()
  email: string
}

export const NotificationsSchema = SchemaFactory.createForClass(Notification)
