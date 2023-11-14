import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiKeyGuard } from "./apikeyguard";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  providers: [AuthService, ApiKeyGuard],
  exports: [AuthService, ApiKeyGuard],
})
export class ConfigurationModule {}
