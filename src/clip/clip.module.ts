import { Module } from "@nestjs/common";
import { ClipService } from "./clip.service";
import { ClipController } from "./clip.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomScheme } from "src/schema/rooms.schema";
import { Clip, ClipScheme } from "src/schema/clips.schema";
import { ClipRepository } from "./clip.repository";
import { S3Module } from "src/aws/s3/s3.module";
import { RoomRepository } from "src/room/room.repository";
import { HashModule } from "src/utils/hash/hash.module";
import { RoomService } from "src/room/room.service";
import { RoomModule } from "src/room/room.module";

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
  ],
  controllers: [ClipController],
  providers: [ClipService, ClipRepository],
})
export class ClipModule {}
