import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ResponseMessage } from "src/utils/message.ko";
import { OsModule } from "src/shared/os/os.module";
import { CreateRoomResponse } from "./dto/response/create-room.response.dto";
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
import { RoomResponse } from "./dto/response/room.response.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";
import { AuthService } from "src/shared/auth/auth.service";

describe("RoomController", () => {
  let controller: RoomController;

  const mockRoomService: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    gather: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OsModule],
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: AuthService,
          useValue: {
            isKeyValid: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("방 생성 테스트", () => {
    it("성공 케이스 ", async () => {
      // Arrange
      jest
        .spyOn(mockRoomService, "create")
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
        .spyOn(mockRoomService, "create")
        .mockResolvedValue(
          Promise.resolve(new RoomDto(roomId, "", password, "", new Date(), []))
        );
      jest.spyOn(mockRoomService, "findOne").mockImplementation((id) => {
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
          ResponseMessage.ROOM_READ_FAIL_WRONG_ID,
          HttpStatus.NOT_FOUND
        )
      );
    });
  });
});
