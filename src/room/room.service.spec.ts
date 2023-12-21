import { HttpException, HttpStatus } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Module } from "src/aws/s3/s3.module";
import { ClipRepository } from "src/clip/clip.repository";
import { ClipDto } from "src/clip/dto/clip.dto";
import { GatheringModule } from "src/gathering/gathering.module";
import { GatheringService } from "src/gathering/gathering.service";
import { Clip } from "src/schema/clips.schema";
import { Room } from "src/schema/rooms.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { HashModule } from "src/utils/hash/hash.module";
import { ResponseMessage } from "src/utils/message.ko";
import { OsModule } from "src/utils/os/os.module";
import { DeleteRoomRequest } from "./dto/request/delete-room.request.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";

describe("RoomService", () => {
  let service: RoomService;
  let gatheringService: GatheringService;
  let repository: RoomRepository;
  let hashHelper: HashHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HashModule, OsModule, GatheringModule, S3Module],
      providers: [
        RoomService,
        RoomRepository,
        ClipRepository,
        {
          provide: getModelToken(Room.name),
          useFactory: () => {},
        },
        {
          provide: getModelToken(Clip.name),
          useFactory: () => {},
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    gatheringService = module.get<GatheringService>(GatheringService);
    repository = module.get<RoomRepository>(RoomRepository);
    const clipRepository = module.get<ClipRepository>(ClipRepository);
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
          key: string,
          s3PathList: string[],
          downloadDir?: string,
          outFilePath?: string
        ) => {
          return "";
        }
      );

    jest.spyOn(clipRepository, "findOne").mockImplementation(async (clipId) => {
      return new ClipDto(clipId, "", "", "", false, "", "");
    });
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

  describe("방 삭제 테스트", () => {
    beforeEach(() => {
      // Arrange
      const roomId = "roomId";
      const password = "password";

      const roomDto: RoomDto = new RoomDto(roomId, "", password, "", null, []);

      jest
        .spyOn(repository, "findOne")
        .mockImplementation(async (id: string): Promise<RoomDto> => {
          return id == roomId
            ? roomDto
            : Object.assign({}, roomDto, { roomId: id });
        });
      jest
        .spyOn(repository, "remove")
        .mockImplementation(async (id: string): Promise<boolean> => {
          return id == roomId;
        });
    });

    it("정상 케이스", async () => {
      // Arrange
      const roomId = "roomId";
      const password = "password";

      const repoResult: any = {};
      jest
        .spyOn(repository, "remove")
        .mockResolvedValue(Promise.resolve(repoResult));

      // Act
      const result = await service.remove(
        roomId,
        new DeleteRoomRequest(password)
      );

      // Assert
      expect(result).toEqual(repoResult);
    });

    it.skip("실패 케이스 - 1. 존재하지 않는 roomId", async () => {
      // Arrange
      const roomId = "wrongRoomId";
      const password = "password";
      // Act & Assert
      expect(async () => {
        await service.remove(roomId, new DeleteRoomRequest(password));
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.ROOM_REMOVE_FAIL_WRONG_ID,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it("실패 케이스 - 2. 잘못된 패스워드", async () => {
      // Arrange
      const roomId = "roomId";
      const password = "wroungPassword";
      // Act & Assert
      await expect(async () => {
        await service.remove(roomId, new DeleteRoomRequest(password));
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.ROOM_REMOVE_FAIL_WONG_PASSWORD,
          HttpStatus.BAD_REQUEST
        )
      );
    });
  });

  describe("취합 테스트", () => {
    const mockResult: RoomDto = new RoomDto("roomId", "", "", "", null, []);

    it("[1] gathering normal", async () => {
      jest
        .spyOn(repository, "findOne")
        .mockResolvedValue(Promise.resolve(mockResult));

      await service.gather("id");
    });
  });
});
