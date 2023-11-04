import { ConfigModule, ConfigService } from "@nestjs/config";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { S3Module } from "src/aws/s3/s3.module";
import { S3Repository } from "src/aws/s3/s3.repository";
import { Room, RoomDocument, RoomScheme } from "src/schema/rooms.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { HashModule } from "src/utils/hash/hash.module";
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
import { RoomRepository } from "./room.repository";

describe("RoomRepository", () => {
  let repository: RoomRepository;
  let s3Repository: S3Repository;
  const presetInputList: CreateRoomRequest[] = [
    new CreateRoomRequest("roomName1", "1234", "target"),
    new CreateRoomRequest("roomName2", null, "target"),
    new CreateRoomRequest("roomName3", "", "target3"),
  ];
  let presetDataList: any[];
  let hashHelper: HashHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            uri: config.get("MONGODB_URL").replace("${NODE_ENV}", "test"),
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeatureAsync([
          {
            name: Room.name,
            useFactory: () => {
              return RoomScheme;
            },
          },
        ]),
        HashModule,
        S3Module,
      ],
      providers: [RoomRepository, S3Repository],
    }).compile();

    repository = module.get<RoomRepository>(RoomRepository);
    s3Repository = module.get<S3Repository>(S3Repository);
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

    jest
      .spyOn(s3Repository, "getPresignedUrl")
      .mockImplementation(async (key: string) => {
        return "signedUrl";
      });
    // reset data for test
    const roomModel: Model<RoomDocument> = module.get(getModelToken(Room.name));
    // clear previous data
    await roomModel.deleteMany({});
    presetDataList = await Promise.all(
      presetInputList.map((it) => {
        const obj: any = it;
        obj.passwordHashed = obj.password;
        return new roomModel(obj).save();
      })
    );
    return true;
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
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("방 생성 테스트", () => {
    it("[1] 방생성 (방이름 + 비밀번호 + 받는사람) ", async () => {
      // Arrange
      const input = new CreateRoomRequest(
        "방이름",
        "1234",
        "받는사람",
        new Date()
      );

      // Act
      const result = await repository.create(input);

      // Assert
      Object.keys(input).forEach((key) => {
        if (key == "password") {
          expect(result.passwordHashed).toEqual(input.password);
          return;
        }
        expect(result[key]).toEqual(input[key]);
      });
    });

    it("[2] 방생성 (방이름 + 받는사람) ", async () => {
      // Arrange
      const input = new CreateRoomRequest("방이름", null, "받는사람");

      // Act
      const result = await repository.create(input);

      // Assert
      Object.keys(input).forEach((key) => {
        if (key == "password") {
          expect(result.passwordHashed).toEqual(input.password);
          return;
        }
        expect(result[key]).toEqual(input[key]);
      });
    });
  });

  describe("방 조회 테스트", () => {
    it("[1] 방 조회", async () => {
      // Arrange;
      const id = presetDataList[0]._id.toString();
      // Act
      const result = await repository.findOne(id);
      // Assert;
      const origin = presetInputList[0];
      Object.keys(origin).forEach((key) => {
        if (key == "password") {
          expect(result.passwordHashed).toEqual(origin.password);
          return;
        }
        expect(result[key]).toEqual(origin[key]);
      });
    });
  });

  describe("방 삭제 테스트", () => {
    it("[1] 방 삭제", async () => {
      // Arrange;
      const id = presetDataList[2]._id.toString();
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

  describe("클립 추가", () => {
    it("클립 추가 ", async () => {
      // Arrange
      const roomId = presetDataList[0]._id.toString();
      const clip = { roomId, clip: "clip" };
      // Act
      const result = await repository.addClip(roomId, clip);
      // Assert
      const lastClip = result.clips[result.clips.length - 1];
      expect(lastClip.roomId).toEqual(roomId.toString());
    });
  });
});
