import { ConfigModule, ConfigService } from "@nestjs/config";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { Clip, ClipDocument, ClipScheme } from "src/schema/clips.schema";
import { CreateClipDto } from "./dto/create-clip.dto";
import { ClipRepository } from "./clip.repository";
import { Room, RoomDocument, RoomScheme } from "src/schema/rooms.schema";

describe("ClipRepository", () => {
  let repository: ClipRepository;
  let roomId: string;
  let presetInputList: any[];
  let presetDataList: any[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            uri: config.get("MONGODB_URL") + "test_clip",
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeatureAsync([
          {
            name: Clip.name,
            useFactory: () => {
              return ClipScheme;
            },
          },
          {
            name: Room.name,
            useFactory: () => {
              return RoomScheme;
            },
          },
        ]),
      ],
      providers: [ClipRepository],
    }).compile();

    repository = module.get<ClipRepository>(ClipRepository);

    // reset data for test
    const roomModel: Model<RoomDocument> = module.get(getModelToken(Room.name));
    const clipModel: Model<ClipDocument> = module.get(getModelToken(Clip.name));

    // clear previous data
    await roomModel.deleteMany({});
    const room = await new roomModel({
      name: "roomName1",
      password: "1234",
      recipient: "target",
    }).save();
    roomId = room.id;
    presetInputList = [
      new CreateClipDto(room.id, "nickname1", true),
      new CreateClipDto(room.id, "nickname2", true),
      new CreateClipDto(room.id, "nickname3", false),
    ];
    presetDataList = await Promise.all(
      presetInputList.map((it) => {
        return new clipModel(it).save();
      })
    );
  });

  beforeEach(async () => {});

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("클립 정보 전체 조회", () => {
    it("조회된 데이터는 array 타입 ", async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("클립 생성 테스트", () => {
    it("[1] 클립 생성 (방번호 + 닉네팀 + 공개 + 이미지) ", async () => {
      // Arrange
      const input = new CreateClipDto(roomId, "nickname", true);

      // Act
      const result = await repository.create(input);

      // Assert
      Object.keys(input).forEach((key) => {
        expect(result[key]).toEqual(input[key]);
      });
    });

    it("[2] 클립 생성 (방번호 + 닉네팀 + 비공개 + 이미지) ", async () => {
      // Arrange
      const input = new CreateClipDto(roomId, "nickname", false);

      // Act
      const result = await repository.create(input);

      // Assert
      Object.keys(input).forEach((key) => {
        expect(result[key]).toEqual(input[key]);
      });
    });
  });

  describe("클립 조회 테스트", () => {
    it("[1] 클립 조회", async () => {
      // Arrange;
      const id = presetDataList[0]._id;
      // Act
      const result = await repository.findOne(id);
      // Assert;
      const origin = presetInputList[0];
      Object.keys(origin).forEach((key) => {
        expect(result[key]).toEqual(origin[key]);
      });
    });
  });

  describe("클립 삭제 테스트", () => {
    it("[1] 클립 삭제", async () => {
      // Arrange;
      const id = presetDataList[0]._id;
      // Act
      const result = await repository.remove(id);
      // Assert;
      expect(result).toBeTruthy();
      const findResult = (await repository.findAll()).filter(
        (it) => it._id == id
      );
      expect(findResult.length).toEqual(0);
    });
  });
});
