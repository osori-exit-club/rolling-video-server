import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ConfigurationDocument = HydratedDocument<Configuration>;

@Schema()
export class Configuration {
  @Prop({ require: true, default: "default" })
  name: string;

  @Prop({ require: true })
  allowApiKeyList: string[];

  @Prop({ require: true })
  blockedApiKeyList: string[];
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
