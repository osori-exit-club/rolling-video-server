import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomService } from "./room.service";
import { RoomController } from "./room.controller";
import { RoomRepository } from "./room.repository";
import { Room, RoomScheme } from "src/schema/rooms.schema";
import { HashModule } from "src/common/hash/hash.module";
import { GatheringModule } from "src/room/feature/gathering/gathering.module";
import { OsModule } from "src/common/os/os.module";
import { S3Module } from "src/common/aws/s3/s3.module";
import { AuthModule } from "src/common/auth/auth.module";
import { ClipRepository } from "src/clip/clip.repository";
import { Clip, ClipScheme } from "src/schema/clips.schema";

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
    HashModule,
    GatheringModule,
    OsModule,
    S3Module,
    AuthModule,
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository, ClipRepository],
  exports: [RoomService, RoomRepository],
})
export class RoomModule {}
