import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Repository } from "./s3.repository";

describe("S3Repository", () => {
  let s3Repository: S3Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [S3Repository],
    }).compile();

    s3Repository = module.get<S3Repository>(S3Repository);
  });

  beforeEach(async () => {});

  it("should be defined", () => {
    expect(s3Repository).toBeDefined();
  });

  describe("파일 다운로드 테스트", () => {
    it("[1] download normal", async () => {
      // Arrange
      const key = "rooms/roomId/clips/6537cf6aba132621e8c041e2.mp4";
      const outDir = path.join(os.tmpdir(), "test", "/video");

      // Act
      await s3Repository.download(key, outDir);

      // Assert
      expect(fs.existsSync(outDir)).toBeTruthy();
      fs.unlink(outDir, () => {});
    });
  });

  describe("파일 유효 테스트", () => {
    it("[1] download normal", async () => {
      // Arrange
      const key = "rooms/roomId/clips/6537cf6aba132621e8c041e2.mp4";

      // Act
      const result = await s3Repository.existsInS3(key);

      // Assert
      expect(result).toBeTruthy();
    });
  });
});
