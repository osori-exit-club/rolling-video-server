import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RoomModule } from "./room/room.module";
import { ClipModule } from "./clip/clip.module";
import { GatheringModule } from "./gathering/gathering.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config
          .get("MONGODB_URL")
          .replace("${NODE_ENV}", config.getOrThrow("NODE_ENV")),
      }),
      inject: [ConfigService],
    }),
    RoomModule,
    ClipModule,
    GatheringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
