import { Module } from "@nestjs/common";
import { ClipService } from "./clip.service";
import { ClipController } from "./clip.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomScheme } from "src/schema/rooms.schema";
import { Clip, ClipScheme } from "src/schema/clips.schema";
import { ClipRepository } from "./clip.repository";
import { S3Module } from "src/aws/s3/s3.module";
import { S3Repository } from "src/aws/s3/s3.repository";
import { RoomRepository } from "src/room/room.repository";
import { HashHelper } from "src/utils/hash/hash.helper";
import { HashModule } from "src/utils/hash/hash.module";

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
  ],
  controllers: [ClipController],
  providers: [
    ClipService,
    ClipRepository,
    RoomRepository,
    S3Repository,
    HashHelper,
  ],
})
export class ClipModule {}
