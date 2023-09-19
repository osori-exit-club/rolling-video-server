import * as fs from "fs";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CompressHelper } from "./comporess.helper";

describe("ClipRepository", () => {
  let compressHelper: CompressHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [CompressHelper],
    }).compile();

    compressHelper = module.get<CompressHelper>(CompressHelper);
  });

  beforeEach(async () => {});

  it("should be defined", () => {
    expect(compressHelper).toBeDefined();
  });

  describe("압축 테스트", () => {
    it("[1] compress normal", () => {
      // Arrange
      const targetDir = "./temp/videos";
      const outDir = "./temp/out/zip/test.zip";
      // Act
      compressHelper.compress(targetDir, outDir);

      // Assert
      expect(fs.existsSync(outDir)).toBeTruthy();
    });
  });
});
