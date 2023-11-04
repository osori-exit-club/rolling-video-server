import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Module } from "src/aws/s3/s3.module";
import { GatheringModule } from "src/gathering/gathering.module";
import { Room } from "src/schema/rooms.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { HashModule } from "src/utils/hash/hash.module";
import { ResponseMessage } from "src/utils/message.ko";
import { OsModule } from "src/utils/os/os.module";
import { CreateRoomResponse } from "./dto/response/create-room.response.dto";
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
import { RoomResponse } from "./dto/response/room.response.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomController } from "./room.controller";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";

describe("RoomController", () => {
  let controller: RoomController;
  let service: RoomService;
  let hashHelper: HashHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        HashModule,
        OsModule,
        GatheringModule,
        S3Module,
      ],
      controllers: [RoomController],
      providers: [
        RoomService,
        RoomRepository,
        {
          provide: getModelToken(Room.name),
          useFactory: () => {},
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get<RoomService>(RoomService);
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
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("방 생성 테스트", () => {
    it("성공 케이스 ", async () => {
      // Arrange
      jest
        .spyOn(service, "create")
        .mockResolvedValue(
          Promise.resolve(new RoomDto("", "", "", "", new Date(), []))
        );

      // Act
      const result = await controller.create(new CreateRoomRequest("", "", ""));

      // Assert
      expect(result).toBeInstanceOf(CreateRoomResponse);
    });
  });

  describe("방 조회 테스트", () => {
    beforeEach(async () => {
      const roomId = "roomId";
      const password = "password";

      jest
        .spyOn(service, "create")
        .mockResolvedValue(
          Promise.resolve(new RoomDto(roomId, "", password, "", new Date(), []))
        );
      jest.spyOn(service, "findOne").mockImplementation((id) => {
        return Promise.resolve(
          id == roomId
            ? new RoomDto(roomId, "", password, "", new Date(), [])
            : null
        );
      });
    });
    it("성공 케이스 ", async () => {
      // Arrange
      const roomId = "roomId";

      // Act
      const result: RoomResponse = await controller.findOne(roomId);

      // Assert
      expect(result).toBeInstanceOf(RoomResponse);
    });

    it("실패 케이스 - 존재하지 않는 roomId", async () => {
      // Arrange
      const roomId: string = "wrongRoomId";

      // Act & Assert
      await expect(async () => {
        await controller.findOne(roomId);
      }).rejects.toThrowError(
        new HttpException(
          ResponseMessage.ROOM_READ_FAIL_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      );
    });
  });
});
