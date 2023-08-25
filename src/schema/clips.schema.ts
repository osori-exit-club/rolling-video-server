import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ClipDocument = HydratedDocument<Clip>;

@Schema()
export class Clip {
  @Prop()
  id: string;

  @Prop({ require: true })
  nickname: string;

  @Prop()
  video_url: string;
}

export const ClipScheme = SchemaFactory.createForClass(Clip);
