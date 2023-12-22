import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RoomModule } from "./domain/room/room.module";
import { ClipModule } from "./domain/clip/clip.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SharedModule } from "./shared/shared.module";
import { MongodbModule } from "./model/mongodb/mongodb.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongodbModule,
    RoomModule,
    ClipModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
