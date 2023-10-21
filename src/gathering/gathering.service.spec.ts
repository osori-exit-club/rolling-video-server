import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Repository } from "src/aws/s3/s3.repository";
import { GatheringService } from "./gathering.service";
import { CompressHelper } from "src/compress/comporess.helper";

describe("GatheringService", () => {
  let service: GatheringService;

  beforeEach(async () => {
    const mockS3Repository = {
      download: async (key: string, outDir: string): Promise<void> => {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("취합 테스트", () => {
    let outDir: string;
    let outPath: string;
    let tempDir: string | null;

    beforeEach(() => {
      outDir = path.join(os.tmpdir(), "rolling-paper");
      tempDir = path.join(os.tmpdir(), "rolling-paper", "roomId");
      outPath = path.join(outDir, "test.zip");
    });

    it("[1] gathering normal", async () => {
      await service.gather(["url1", "url2"], tempDir, outPath);
      expect(fs.existsSync(outPath)).toBeTruthy();
    });

    afterEach(() => {
      if (outDir != null) {
        fs.unlink(outDir, () => {});
      }
      if (tempDir != null) {
        fs.unlink(tempDir, () => {});
      }
    });
  });
});
