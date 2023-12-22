import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { RoomDto } from "src/room/dto/room.dto";
import { RoomService } from "src/room/room.service";
import { ResponseMessage } from "src/utils/message.ko";
import { ClipController } from "./clip.controller";
import { ClipService } from "./clip.service";
import { ClipResponse } from "./dto/response/clip.response.dto";
import { ClipDto } from "./dto/clip.dto";
import { CreateClipResponse } from "./dto/response/create-clip.response.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";
import { AuthService } from "src/auth/auth.service";

describe("ClipController", () => {
  let controller: ClipController;

  const mockClipService: any = {
    create: jest.fn(),
    createCompactedVideo: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockRoomService: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    gather: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ClipController],
      providers: [
        {
          provide: ClipService,
          useValue: mockClipService,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: AuthService,
          useValue: {
            iskeyValid: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<ClipController>(ClipController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
  describe("클립 생성 테스트", () => {
    beforeEach(async () => {
      const roomId = "roomId";
      const clipId = "clipId";
      const password = "password";

      jest
        .spyOn(mockClipService, "create")
        .mockResolvedValue(
          Promise.resolve(
            new CreateClipResponse(
              new ClipDto(
                clipId,
                roomId,
                "nickName",
                "message",
                true,
                "mp4",
                "password"
              )
            )
          )
        );

      jest.spyOn(mockClipService, "findOne").mockImplementation((id) => {
        return Promise.resolve(
          id == clipId
            ? new ClipResponse(
                new ClipDto(
                  clipId,
                  roomId,
                  "nickName",
                  "message",
                  true,
                  "mp4",
                  "password"
                ),
                "signedUrl"
              )
            : null
        );
      });
    });

    it("성공 케이스 ", async () => {
      // Arrange
      jest
        .spyOn(mockRoomService, "findOne")
        .mockResolvedValue(
          Promise.resolve(
            new RoomDto(
              "roomId",
              "",
              "",
              "",
              new Date(new Date().getTime() + 5),
              []
            )
          )
        );

      // Act
      const result: CreateClipResponse = await controller.create(
        new CreateClipRequest("", "", "", true),
        { size: 1_000_000 }
      );

      // Assert
      expect(result).toBeInstanceOf(CreateClipResponse);
    });

    it("실패 케이스 - 1. 존재하지 않는 roomId", async () => {
      // Arrange
      jest
        .spyOn(mockRoomService, "findOne")
        .mockResolvedValue(Promise.resolve(null));

      // Act & Assert
      await expect(async () => {
        await controller.create(new CreateClipRequest("", "", "", true), {
          size: 10_000_000,
        });
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.ROOM_READ_FAIL_WRONG_ID,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it.skip("실패 케이스 - 2. 초과된 파일 크기", async () => {
      // Arrange
      jest
        .spyOn(mockRoomService, "findOne")
        .mockResolvedValue(
          Promise.resolve(
            new RoomDto(
              "roomId",
              "",
              "",
              "",
              new Date(new Date().getTime() + 5),
              []
            )
          )
        );

      // Act & Assert
      await expect(async () => {
        await controller.create(new CreateClipRequest("", "", "", true), {
          size: 20_000_000,
        });
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.CLIP_CREATE_FAIL_SIZE_LIMIT("15MB"),
          HttpStatus.BAD_REQUEST
        )
      );
    });

    it("실패 케이스 - 3. 만료된 기한", async () => {
      // Arrange
      jest
        .spyOn(mockRoomService, "findOne")
        .mockResolvedValue(
          Promise.resolve(
            new RoomDto(
              "roomId",
              "",
              "",
              "",
              new Date(new Date().getTime() - 1),
              []
            )
          )
        );

      // Act & Assert
      try {
        await controller.create(new CreateClipRequest("", "", "", true), {
          size: 10_000_000,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message.slice(0, 10)).toEqual(
          ResponseMessage.CLIP_CREATE_FAIL_EXPIRED("", "").slice(0, 10)
        );
        expect(err.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe("클립 조회 테스트", () => {
    beforeEach(async () => {
      const roomId = "roomId";
      const clipId = "clipId";

      jest.spyOn(mockClipService, "create").mockResolvedValue(
        Promise.resolve(
          new CreateClipResponse({
            clipId,
            roomId,
            nickname: "nickName",
            message: "message",
            isPublic: true,
            extension: "mp4",
            password: "password",
          })
        )
      );

      jest.spyOn(mockClipService, "findOne").mockImplementation((id) => {
        return Promise.resolve(
          id == clipId
            ? new ClipResponse(
                new ClipDto(
                  clipId,
                  roomId,
                  "nickName",
                  "message",
                  true,
                  "mp4",
                  "password"
                ),
                "signedUrl"
              )
            : null
        );
      });
    });

    it("성공 케이스 ", async () => {
      // Arrange
      const clipId = "clipId";

      // Act
      const result: ClipResponse = await controller.findOne(clipId);

      // Assert
      expect(result).toBeInstanceOf(ClipResponse);
    });

    it("실패 케이스 - 존재하지 않는 roomId", async () => {
      // Arrange
      const clipId: string = "wrongId";

      // Act & Assert
      await expect(async () => {
        await controller.findOne(clipId);
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.CLIP_READ_FAIL_WRONG_ID,
          HttpStatus.NOT_FOUND
        )
      );
    });
  });
});
