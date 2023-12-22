import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OsHelper } from "./os.helper";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  providers: [OsHelper],
  exports: [OsHelper],
})
export class OsModule {}
