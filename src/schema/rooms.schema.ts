import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument } from "mongoose";
import { Clip, ClipScheme } from "./clips.schema";

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } })
export class Room {
  @Prop({ require: true })
  name: string;

  @Prop()
  password: string;

  @Prop({ require: true })
  recipient: string;

  @Prop({ type: Date, default: new Date() })
  dueDate: Date;

  @Prop({ type: [ClipScheme], require: true })
  clips: Clip[];
}

export const RoomScheme = SchemaFactory.createForClass(Room);
