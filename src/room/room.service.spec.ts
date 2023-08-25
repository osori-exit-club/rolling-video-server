import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Room } from "src/schema/rooms.schema";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";

describe("RoomService", () => {
  let service: RoomService;
  let repository: RoomRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    repository = module.get<RoomRepository>(RoomRepository);
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
});
