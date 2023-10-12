import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HashHelper } from "./hash.helper";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
  ],
  providers: [HashHelper],
  exports: [HashHelper],
})
export class hashModule {}
