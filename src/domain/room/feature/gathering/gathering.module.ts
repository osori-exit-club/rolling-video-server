import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { S3Module } from "src/shared/aws/s3/s3.module";
import { CompressModule } from "src/domain/room/feature/compress/compress.module";
import { GatheringService } from "./gathering.service";
import { FfmpegModule } from "src/shared/ffmpeg/ffmpeg.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    S3Module,
    CompressModule,
    FfmpegModule,
  ],
  providers: [GatheringService],
  exports: [GatheringService],
})
export class GatheringModule {}
