import { ConfigModule } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Module } from "src/aws/s3/s3.module";
import { GatheringModule } from "src/gathering/gathering.module";
import { Room } from "src/schema/rooms.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { HashModule } from "src/utils/hash/hash.module";
import { OsModule } from "src/utils/os/os.module";
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
});
