import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FfmpegService } from "./ffmpeg.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  providers: [FfmpegService],
  exports: [FfmpegService],
})
export class FfmpegModule {}
