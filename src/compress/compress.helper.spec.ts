import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CompressHelper } from "./comporess.helper";
import { ConsoleLogger } from "@nestjs/common";

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
        "Rolling-Paper",
        "test",
        "compress-test-target"
      );
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const outPath = path.join(
        os.tmpdir(),
        "Rolling-Paper",
        "test",
        "compress-test-out",
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

  describe("압축 해제 테스트", () => {
    it("[1] extract", () => {
      // Arrange
      const targetDir = path.join(
        os.tmpdir(),
        "Rolling-Paper",
        "test",
        "compress-test-target"
      );
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(targetDir, `video1.mp4`), "video1 data");
      fs.writeFileSync(path.join(targetDir, `video2.mp4`), "video2 data");

      const outPath = path.join(
        os.tmpdir(),
        "Rolling-Paper",
        "test",
        "compress-test-out",
        "test.zip"
      );

      const extractDir = path.join(
        os.tmpdir(),
        "Rolling-Paper",
        "test",
        "extract-test"
      );
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }

      // Act
      compressHelper.compress(targetDir, outPath);
      compressHelper.extract(outPath, extractDir);
      const outputName = fs
        .readdirSync(extractDir, { withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name);

      expect(outputName[0]).toEqual("video1.mp4");
      expect(outputName[1]).toEqual("video2.mp4");

      // Assert
      fs.unlink(targetDir, () => {});
      fs.unlink(outPath, () => {});
      fs.unlink(extractDir, () => {});
    });
  });
});
