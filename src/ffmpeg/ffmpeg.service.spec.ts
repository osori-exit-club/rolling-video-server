import * as path from "path";
import * as fs from "fs";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { OsHelper } from "src/utils/os/os.helper";
import { OsModule } from "src/utils/os/os.module";
import { FfmpegModule } from "./ffmpeg.module";
import { FfmpegService } from "./ffmpeg.service";

describe("GatheringService", () => {
  let service: FfmpegService;
  let osHepler: OsHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        FfmpegModule,
        OsModule,
      ],
      providers: [FfmpegService],
    }).compile();

    service = module.get<FfmpegService>(FfmpegService);
    osHepler = module.get<OsHelper>(OsHelper);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("webm 생성 테스트", () => {
    it("[1] createWebm", async () => {
      const url =
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
      await osHepler.openTempDirectory(
        "ffmpeg-test-temp-dir",
        async (tempDir: string) => {
          const outPath = path.join(tempDir, "webmTempFile.webm");
          await service.makeWebmFile(url, outPath);
          const exist = fs.existsSync(outPath);
          expect(exist).toBeTruthy();
        }
      );
      const outPath = "webmTempFile.webm";
      await service.makeWebmFile(url, outPath);
      const exist = fs.existsSync(outPath);
      expect(exist).toBeTruthy();
    }, 30_000);
  });
});
