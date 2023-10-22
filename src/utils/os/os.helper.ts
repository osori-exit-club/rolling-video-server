import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class OsHelper {
  constructor(readonly configService: ConfigService) {}

  async openTempDirectory(
    dirname: string,
    callback: (tempDir: string) => Promise<void>
  ): Promise<void> {
    const targetDir = path.join(
      os.tmpdir(),
      "Rolling-Paper",
      this.configService.get("NODE_ENV") || "test",
      dirname
    );
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    try {
      await callback(targetDir);
    } finally {
      fs.unlink(targetDir, () => {});
    }
  }

  async createTempDirectory(dirname: string): Promise<string> {
    const targetDir = path.join(
      os.tmpdir(),
      "Rolling-Paper",
      this.configService.get("NODE_ENV") || "test",
      dirname
    );
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    return targetDir;
  }
}
