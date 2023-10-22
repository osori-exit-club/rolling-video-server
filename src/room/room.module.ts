import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomService } from "./room.service";
import { RoomController } from "./room.controller";
import { RoomRepository } from "./room.repository";
import { Room, RoomScheme } from "src/schema/rooms.schema";
import { HashModule } from "src/utils/hash/hash.module";
import { GatheringModule } from "src/gathering/gathering.module";
import { OsModule } from "src/utils/os/os.module";

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
    HashModule,
    GatheringModule,
    OsModule,
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository],
  exports: [RoomService, RoomRepository],
})
export class RoomModule {}
