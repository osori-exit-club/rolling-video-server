import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { S3Repository } from "./s3.repository";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  providers: [S3Repository],
  exports: [S3Repository],
})
export class S3Module {}
