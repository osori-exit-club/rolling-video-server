import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Configuration,
  ConfigurationSchema,
} from "src/model/mongodb/schema/configuration.schema";
import { ApiKeyGuard } from "./apikeyguard";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    MongooseModule.forFeatureAsync([
      {
        name: Configuration.name,
        useFactory: () => {
          return ConfigurationSchema;
        },
      },
    ]),
  ],
  providers: [AuthService, ApiKeyGuard],
  exports: [AuthService, ApiKeyGuard],
})
export class AuthModule {}
