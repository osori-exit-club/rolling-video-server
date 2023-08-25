import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
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

  @Prop({ type: [ClipScheme], require: true })
  clips: Clip[];
}

export const RoomScheme = SchemaFactory.createForClass(Room);
