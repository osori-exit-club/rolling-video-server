import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as winston from "winston";
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from "nest-winston";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RoomModule } from "./domain/room/room.module";
import { ClipModule } from "./domain/clip/clip.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SharedModule } from "./shared/shared.module";
import { MongodbModule } from "./shared/mongodb/mongodb.module";
import { LoggerMiddleware } from "./shared/logger/logger.middleware";

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
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === "prd" ? "info" : "silly",
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike("RollingVideos", {
              prettyPrint: true,
            })
          ),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
