import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Clip } from "src/schema/clips.schema";
import { Room } from "src/schema/rooms.schema";
import { ClipRepository } from "./clip.repository";
import { ClipService } from "./clip.service";

describe("ClipService", () => {
  let service: ClipService;
  let repository: ClipRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClipService,
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

    service = module.get<ClipService>(ClipService);
    repository = module.get<ClipRepository>(ClipRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("클립 정보 전체 조회", () => {
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
