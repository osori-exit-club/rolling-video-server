import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } })
export class Room {
  @Prop({ unique: true })
  id: string;

  @Prop({ require: true })
  name: string;

  @Prop()
  password: string;

  @Prop({ require: true })
  recipient: string;

  @Prop({ type: { nickname: { type: String }, video_utl: { type: String } } })
  video_url: { nickname: string; video_url: string }[];
}

export const RoomScheme = SchemaFactory.createForClass(Room);
