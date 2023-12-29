import * as fs from "fs";
import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CompressHelper } from "./compress.helper";
import { OsModule } from "src/shared/os/os.module";
import { OsHelper } from "src/shared/os/os.helper";

describe("CompressHelper", () => {
  let compressHelper: CompressHelper;
  let osHelper: OsHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        OsModule,
      ],
      providers: [CompressHelper],
    }).compile();

    compressHelper = module.get<CompressHelper>(CompressHelper);
    osHelper = module.get<OsHelper>(OsHelper);
  });

  beforeEach(async () => {});

  it("should be defined", () => {
    expect(compressHelper).toBeDefined();
  });

  describe("압축 테스트", () => {
    it("[1] compress normal", async () => {
      await osHelper.openTempDirectory(
        "compress-test-target",
        async (targetDir: string) => {
          await osHelper.openTempDirectory(
            "compress-test-out",
            async (outputDir: string) => {
              // Arrange
              const outPath = path.join(outputDir, "test.zip");

              // Act
              compressHelper.compress(targetDir, outPath);

              // Assert
              expect(fs.existsSync(outPath)).toBeTruthy();
            }
          );
        }
      );
    });
  });

  describe("압축 해제 테스트", () => {
    it("[1] extract", async () => {
      await osHelper.openTempDirectory(
        "compress-test-target",
        async (targetDir: string) => {
          await osHelper.openTempDirectory(
            "compress-test-out",
            async (outputDir: string) => {
              await osHelper.openTempDirectory(
                "extract-test",
                async (extractDir: string) => {
                  // Arrange
                  fs.writeFileSync(
                    path.join(targetDir, `video1.mp4`),
                    "video1 data"
                  );
                  fs.writeFileSync(
                    path.join(targetDir, `video2.mp4`),
                    "video2 data"
                  );

                  const outPath = path.join(outputDir, "test.zip");

                  // Act
                  compressHelper.compress(targetDir, outPath);
                  compressHelper.extract(outPath, extractDir);

                  // Assert
                  const outputName = fs
                    .readdirSync(extractDir, { withFileTypes: true })
                    .filter((dirent) => dirent.isFile())
                    .map((dirent) => dirent.name);

                  expect(outputName[0]).toEqual("video1.mp4");
                  expect(outputName[1]).toEqual("video2.mp4");
                }
              );
            }
          );
        }
      );
    });
  });
});
