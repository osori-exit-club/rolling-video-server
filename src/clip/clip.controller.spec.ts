import { HttpException, HttpStatus } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Module } from "src/aws/s3/s3.module";
import { GatheringModule } from "src/gathering/gathering.module";
import { RoomDto } from "src/room/dto/room.dto";
import { RoomRepository } from "src/room/room.repository";
import { RoomService } from "src/room/room.service";
import { Clip } from "src/schema/clips.schema";
import { Room } from "src/schema/rooms.schema";
import { HashModule } from "src/utils/hash/hash.module";
import { ResponseMessage } from "src/utils/message.ko";
import { OsModule } from "src/utils/os/os.module";
import { ClipController } from "./clip.controller";
import { ClipRepository } from "./clip.repository";
import { ClipService } from "./clip.service";
import { ClipResponse } from "./dto/response/clip.response.dto";
import { ClipDto } from "./dto/clip.dto";
import { CreateClipResponse } from "./dto/response/create-clip.response.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";

describe("ClipController", () => {
  let controller: ClipController;
  let service: ClipService;
  let roomService: RoomService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [S3Module, HashModule, OsModule, GatheringModule],
      controllers: [ClipController],
      providers: [
        ClipService,
        ClipRepository,
        RoomService,
        RoomRepository,
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

    controller = module.get<ClipController>(ClipController);
    service = module.get<ClipService>(ClipService);
    roomService = module.get<RoomService>(RoomService);
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
        .spyOn(service, "create")
        .mockResolvedValue(
          Promise.resolve(
            new CreateClipResponse(
              new ClipDto(clipId, roomId, "nickName", true, "mp4", "password")
            )
          )
        );

      jest.spyOn(service, "findOne").mockImplementation((id) => {
        return Promise.resolve(
          id == clipId
            ? new ClipResponse(
                new ClipDto(
                  clipId,
                  roomId,
                  "nickName",
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
        .spyOn(roomService, "findOne")
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
        new CreateClipRequest("", "", true),
        { size: 1_000_000 }
      );

      // Assert
      expect(result).toBeInstanceOf(CreateClipResponse);
    });

    it("실패 케이스 - 1. 존재하지 않는 roomId", async () => {
      // Arrange
      jest
        .spyOn(roomService, "findOne")
        .mockResolvedValue(Promise.resolve(null));

      // Act & Assert
      await expect(async () => {
        await controller.create(new CreateClipRequest("", "", true), {
          size: 10_000_000,
        });
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.ROOM_READ_FAIL_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it("실패 케이스 - 2. 만료된 기한", async () => {
      // Arrange
      jest
        .spyOn(roomService, "findOne")
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
        await controller.create(new CreateClipRequest("", "", true), {
          size: 20_000_000,
        });
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.CLIP_CREATE_FAIL_SIZE_LIMIT("15MB"),
          HttpStatus.BAD_REQUEST
        )
      );
    });

    it("실패 케이스 - 3. 초과된 파일 크기", async () => {
      // Arrange
      jest
        .spyOn(roomService, "findOne")
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
        await controller.create(new CreateClipRequest("", "", true), {
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
      const password = "password";

      jest.spyOn(service, "create").mockResolvedValue(
        Promise.resolve(
          new CreateClipResponse({
            clipId,
            roomId,
            nickname: "nickName",
            isPublic: true,
            extension: "mp4",
            password: "password",
          })
        )
      );

      jest.spyOn(service, "findOne").mockImplementation((id) => {
        return Promise.resolve(
          id == clipId
            ? new ClipResponse(
                new ClipDto(
                  clipId,
                  roomId,
                  "nickName",
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
          ResponseMessage.CLIP_READ_FAIL_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      );
    });
  });
});
