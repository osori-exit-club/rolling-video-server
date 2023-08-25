import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomService } from "./room.service";
import { RoomController } from "./room.controller";
import { RoomRepository } from "./room.repository";
import { Room, RoomScheme } from "src/schema/rooms.schema";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Room.name,
        useFactory: () => {
          return RoomScheme;
        },
      },
    ]),
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository],
})
export class RoomModule {}
