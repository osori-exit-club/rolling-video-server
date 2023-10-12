import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument } from "mongoose";
import { ClipDocument, ClipScheme } from "./clips.schema";

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } })
export class Room {
  @Prop({ require: true })
  name: string;

  @Prop({ require: true, default: null, nullable: true })
  passwordHashed: string | null;

  @Prop({ require: true })
  recipient: string;

  @Prop({ type: Date, default: new Date() })
  dueDate: Date;

  @Prop({ type: [ClipScheme], require: true })
  clips: ClipDocument[];
}

export const RoomScheme = SchemaFactory.createForClass(Room);
