import * as fs from "fs";
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
      const key =
        "videos/65099d54d2ba36bb284678e2/6509a7ab8173da335d01c6bc.mp4";
      const outDir = "./temp/video";

      // Act
      await s3Repository.download(key, outDir);

      // Assert
      expect(fs.existsSync(outDir)).toBeTruthy();
    });
    it("[2] download with full key", async () => {
      // Arrange
      const key =
        "https://careerlego-salt-test.s3.amazonaws.com/videos/6534a53acda0e2345fe35bc7/6534a543cda0e2345fe35bc9.mp4";
      const outDir = "./temp/video";

      // Act
      await s3Repository.download(key, outDir);

      // Assert
      expect(fs.existsSync(outDir)).toBeTruthy();
    });
  });
});
