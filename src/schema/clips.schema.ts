import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ClipDocument = HydratedDocument<Clip>;

@Schema()
export class Clip {
  @Prop({ require: true })
  roomId: string;

  @Prop({ require: true })
  nickname: string;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ require: true })
  extension: string;

  @Prop({ require: true })
  password: string;
}

export const ClipScheme = SchemaFactory.createForClass(Clip);
