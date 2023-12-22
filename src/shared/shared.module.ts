import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { S3Module } from "./aws/s3/s3.module";
import { HashModule } from "./hash/hash.module";
import { OsModule } from "./os/os.module";

@Module({
  imports: [AuthModule, S3Module, HashModule, OsModule],
  controllers: [],
  providers: [],
})
export class SharedModule {}
