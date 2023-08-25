import { Module } from "@nestjs/common";
import { ClipService } from "./clip.service";
import { ClipController } from "./clip.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomScheme } from "src/schema/rooms.schema";
import { Clip, ClipScheme } from "src/schema/clips.schema";
import { ClipRepository } from "./clip.repository";

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
  ],
  controllers: [ClipController],
  providers: [ClipService, ClipRepository],
})
export class ClipModule {}
