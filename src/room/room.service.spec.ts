import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Repository } from "src/shared/aws/s3/s3.repository";
import { ClipRepository } from "src/clip/clip.repository";
import { ClipDto } from "src/clip/dto/clip.dto";
import { GatheringService } from "src/room/feature/gathering/gathering.service";
import { HashHelper } from "src/shared/hash/hash.helper";
import { ResponseMessage } from "src/utils/message.ko";
import { OsModule } from "src/shared/os/os.module";
import { DeleteRoomRequest } from "./dto/request/delete-room.request.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";

describe("RoomService", () => {
  let service: RoomService;

  const mockRoomRepository: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    addClip: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OsModule],
      providers: [
        RoomService,
        {
          provide: ClipRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn().mockImplementation(async (clipId) => {
              return new ClipDto(clipId, "roomId", "", "", false, "mp4", "");
            }),
            remove: jest.fn(),
          },
        },
        {
          provide: RoomRepository,
          useValue: mockRoomRepository,
        },
        {
          provide: S3Repository,
          useValue: {
            existsInS3: jest.fn().mockResolvedValue(true),
            getPresignedUrl: jest
              .fn()
              .mockResolvedValue(Promise.resolve("video_url")),
          },
        },
        {
          provide: HashHelper,
          useValue: {
            createHash: jest
              .fn()
              .mockImplementation(async (password: string) => {
                return password;
              }),
            isMatch: jest
              .fn()
              .mockImplementation(async (password: string, hash: string) => {
                return password == hash;
              }),
          },
        },
        {
          provide: GatheringService,
          useValue: {
            gather: jest
              .fn()
              .mockImplementation(
                async (
                  key: string,
                  s3PathList: string[],
                  downloadDir?: string,
                  outFilePath?: string
                ) => {
                  return "";
                }
              ),
          },
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("방 정보 전체 조회", () => {
    it("조회된 데이터는 array 타입 ", async () => {
      // Arrange
      jest
        .spyOn(mockRoomRepository, "findAll")
        .mockResolvedValue(Promise.resolve([]));

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
        .spyOn(mockRoomRepository, "findOne")
        .mockImplementation(async (id: string): Promise<RoomDto> => {
          return id == roomId
            ? roomDto
            : Object.assign({}, roomDto, { roomId: id });
        });
      jest
        .spyOn(mockRoomRepository, "remove")
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
        .spyOn(mockRoomRepository, "remove")
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
    const mockResult: RoomDto = new RoomDto("roomId", "", "", "", null, [
      "clipId1",
      "clipId2",
    ]);

    it("[1] gathering normal", async () => {
      jest.spyOn(mockRoomRepository, "findOne").mockResolvedValue(mockResult);

      await service.gather("id");
    });
  });
});
