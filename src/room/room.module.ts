import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomService } from "./room.service";
import { RoomController } from "./room.controller";
import { RoomRepository } from "./room.repository";
import { Room, RoomScheme } from "src/schema/rooms.schema";
import { HashModule } from "src/utils/hash/hash.module";
import { GatheringModule } from "src/gathering/gathering.module";
import { OsModule } from "src/utils/os/os.module";
import { S3Module } from "src/aws/s3/s3.module";
import { AuthModule } from "src/auth/auth.module";

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
    S3Module,
    AuthModule,
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository],
  exports: [RoomService, RoomRepository],
})
export class RoomModule {}
