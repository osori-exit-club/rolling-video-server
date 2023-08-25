import { ConfigModule, ConfigService } from "@nestjs/config";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Room, RoomScheme } from "src/schema/rooms.schema";
import { RoomModule } from "./room.module";
import { RoomRepository } from "./room.repository";

describe("RoomRepository", () => {
  let repository: RoomRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            uri: config.get("MONGODB_URL") + "test",
          }),
          inject: [ConfigService],
        }),
        RoomModule,
      ],
      providers: [
        RoomRepository,
        {
          provide: getModelToken(Room.name),
          useFactory: () => {},
        },
      ],
    }).compile();

    repository = module.get<RoomRepository>(RoomRepository);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("방 정보 전체 조회", () => {
    it("조회된 데이터는 array 타입 ", async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
    });
  });
});
