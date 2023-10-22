import * as fs from "fs";
import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Repository } from "src/aws/s3/s3.repository";
import { GatheringService } from "./gathering.service";
import { CompressHelper } from "src/compress/comporess.helper";
import { OsHelper } from "src/utils/os/os.helper";
import { OsModule } from "src/utils/os/os.module";

describe("GatheringService", () => {
  let service: GatheringService;
  let osHelper: OsHelper;

  beforeEach(async () => {
    const mockS3Repository = {
      download: async (key: string, outDir: string): Promise<void> => {
        fs.writeFileSync(path.join(outDir, `${key}.mp4`), "video data");
      },

      uploadFile: async ({
        buffer,
        key,
      }: {
        buffer: Buffer;
        key: string;
      }): Promise<string> => {
        return `uploaded ${key}`;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        OsModule,
      ],
      providers: [
        GatheringService,
        {
          provide: S3Repository,
          useValue: mockS3Repository,
        },
        CompressHelper,
      ],
    }).compile();

    service = module.get<GatheringService>(GatheringService);
    osHelper = module.get<OsHelper>(OsHelper);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("취합 테스트", () => {
    it("[1] gathering normal", async () => {
      await osHelper.openTempDirectory(
        "gathering-test-temp-dir",
        async (tempDir: string) => {
          await osHelper.openTempDirectory(
            "gathering-test-out-dir",
            async (outDir: string) => {
              const outPath: string = path.join(outDir, "test.zip");
              await service.gather(["url1", "url2"], tempDir, outPath);
              expect(fs.existsSync(outPath)).toBeTruthy();
            }
          );
        }
      );
    });
  });
});
