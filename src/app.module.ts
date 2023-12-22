import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RoomModule } from "./room/room.module";
import { ClipModule } from "./clip/clip.module";
import { AuthModule } from "./shared/auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
