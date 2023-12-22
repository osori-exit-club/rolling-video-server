import { Module } from "@nestjs/common";
import { ClipService } from "./clip.service";
import { ClipController } from "./clip.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomScheme } from "src/model/mongodb/schema/rooms.schema";
import { Clip, ClipScheme } from "src/model/mongodb/schema/clips.schema";
import { ClipRepository } from "./clip.repository";
import { S3Module } from "src/shared/aws/s3/s3.module";
import { HashModule } from "src/shared/hash/hash.module";
import { RoomModule } from "src/domain/room/room.module";
import { AuthModule } from "src/shared/auth/auth.module";
import { FfmpegModule } from "src/domain/clip/feature/ffmpeg/ffmpeg.module";
import { OsModule } from "src/shared/os/os.module";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Clip.name,
        useFactory: () => {
          return ClipScheme;
        },
      },
      {
        name: Room.name,
        useFactory: () => {
          return RoomScheme;
        },
      },
    ]),
    S3Module,
    HashModule,
    RoomModule,
    AuthModule,
    FfmpegModule,
    OsModule,
  ],
  controllers: [ClipController],
  providers: [ClipService, ClipRepository],
})
export class ClipModule {}
