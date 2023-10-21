import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { S3Module } from "src/aws/s3/s3.module";
import { CompressModule } from "src/compress/compress.module";
import { GatheringService } from "./gathering.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    S3Module,
    CompressModule,
  ],
  providers: [GatheringService],
  exports: [GatheringService],
})
export class GatheringModule {}
