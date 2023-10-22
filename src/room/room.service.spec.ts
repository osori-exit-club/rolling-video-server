import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { GatheringModule } from "src/gathering/gathering.module";
import { GatheringService } from "src/gathering/gathering.service";
import { Room } from "src/schema/rooms.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { HashModule } from "src/utils/hash/hash.module";
import { OsModule } from "src/utils/os/os.module";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";

describe("RoomService", () => {
  let service: RoomService;
  let gatheringService: GatheringService;
  let repository: RoomRepository;
  let hashHelper: HashHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HashModule, OsModule, GatheringModule],
      providers: [
        RoomService,
        RoomRepository,
        {
          provide: getModelToken(Room.name),
          useFactory: () => {},
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    gatheringService = module.get<GatheringService>(GatheringService);
    repository = module.get<RoomRepository>(RoomRepository);
    hashHelper = module.get<HashHelper>(HashHelper);

    jest
      .spyOn(hashHelper, "createHash")
      .mockImplementation(async (password: string) => {
        return password;
      });

    jest
      .spyOn(hashHelper, "isMatch")
      .mockImplementation(async (password: string, hash: string) => {
        return password == hash;
      });

    jest
      .spyOn(gatheringService, "gather")
      .mockImplementation(
        async (
          fileUrlList: string[],
          downloadDir?: string,
          outFilePath?: string
        ) => {
          return "";
        }
      );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("방 정보 전체 조회", () => {
    it("조회된 데이터는 array 타입 ", async () => {
      // Arrange
      jest.spyOn(repository, "findAll").mockResolvedValue(Promise.resolve([]));

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe("취합 테스트", () => {
    const mockResult: any = {
      _id: "id",
      clips: ["url1", "url2"].map((url) => {
        return { _id: "clipId", roomId: "id", videoUrl: url };
      }),
    };

    it("[1] gathering normal", async () => {
      jest
        .spyOn(repository, "findOne")
        .mockResolvedValue(Promise.resolve(mockResult));

      await service.gather("id");
    });
  });
});
