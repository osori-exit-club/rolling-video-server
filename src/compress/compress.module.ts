import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CompressHelper } from "./comporess.helper";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  providers: [CompressHelper],
  exports: [CompressHelper],
})
export class CompressModule {}
