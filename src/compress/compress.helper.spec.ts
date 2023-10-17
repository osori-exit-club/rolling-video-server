import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CompressHelper } from "./comporess.helper";

describe("CompressHelper", () => {
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
      const targetDir = path.join(
        os.tmpdir(),
        "rolling-paper-server-compress-test-target"
      );
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const outPath = path.join(
        os.tmpdir(),
        "rolling-paper-server-compress-test-out",
        "test.zip"
      );
      // Act
      compressHelper.compress(targetDir, outPath);

      // Assert
      expect(fs.existsSync(outPath)).toBeTruthy();

      fs.unlink(targetDir, () => {});
      fs.unlink(outPath, () => {});
    });
  });
});
