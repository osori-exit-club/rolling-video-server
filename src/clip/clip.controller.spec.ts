import { HttpException, HttpStatus } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Module } from "src/aws/s3/s3.module";
import { GatheringModule } from "src/gathering/gathering.module";
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
import { ClipResponseDto } from "./dto/clip-response.dto";
import { ClipDto } from "./dto/clip.dto";
import { CreateClipDto } from "./dto/create-clip.dto";

describe("ClipController", () => {
  let controller: ClipController;
  let service: ClipService;

  beforeEach(async () => {
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
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("클립 조회 테스트", () => {
    beforeEach(async () => {
      const roomId = "roomId";
      const clipId = "clipId";
      const password = "password";

      jest
        .spyOn(service, "create")
        .mockResolvedValue(
          Promise.resolve(
            new ClipResponseDto(
              new ClipDto(clipId, roomId, "nickName", true, "mp4"),
              "signedUrl"
            )
          )
        );

      jest.spyOn(service, "findOne").mockImplementation((id) => {
        return Promise.resolve(
          id == clipId
            ? new ClipResponseDto(
                new ClipDto(clipId, roomId, "nickName", true, "mp4"),
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
      const result: ClipResponseDto = await controller.findOne(clipId);

      // Assert
      expect(result).toBeInstanceOf(ClipResponseDto);
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
