import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Repository } from "src/aws/s3/s3.repository";
import { ClipDto } from "src/clip/dto/clip.dto";
import { RoomDto } from "src/room/dto/room.dto";
import { RoomService } from "src/room/room.service";
import { GatheringService } from "./gathering.service";
import { CompressHelper } from "src/compress/comporess.helper";
import { CompressModule } from "src/compress/compress.module";

describe("GatheringService", () => {
  let service: GatheringService;
  let tempDir: string | null;
  const roomId = "65099d54d2ba36bb284678e2";

  beforeEach(async () => {
    const mockS3Repository = {
      download: async (key: string, outDir: string): Promise<void> => {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outDir, `${key}.mp4`), "video data");
      },
    };
    const mockRoomService = {
      findOne: async (roomId: string): Promise<RoomDto> => {
        return new RoomDto(
          "id",
          "name",
          "passwordHashed",
          "recipient",
          null,
          ["url1", "url2"].map(
            (url) => new ClipDto("clipId", roomId, "nickname", true, url)
          )
        );
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
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        CompressHelper,
      ],
    }).compile();

    service = module.get<GatheringService>(GatheringService);
    tempDir = path.join(os.tmpdir(), roomId);
  });

  afterEach(async () => {
    if (tempDir != null) {
      fs.unlink(tempDir, () => {});
    }
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("취합 테스트", () => {
    let outDir: string;
    let outPath: string;

    beforeEach(() => {
      outDir = path.join(os.tmpdir(), "rolling-paper");
      outPath = path.join(outDir, "test.zip");
    });

    it("[1] gathering normal", async () => {
      await service.gather(roomId, tempDir, outPath);
      expect(fs.existsSync(outPath)).toBeTruthy();
    });

    afterEach(() => {
      fs.unlink(outDir, () => {});
    });
  });
});
