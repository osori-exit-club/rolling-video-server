import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Module } from "src/aws/s3/s3.module";
import { GatheringModule } from "src/gathering/gathering.module";
import { RoomRepository } from "src/room/room.repository";
import { RoomService } from "src/room/room.service";
import { Clip } from "src/schema/clips.schema";
import { Room } from "src/schema/rooms.schema";
import { HashModule } from "src/utils/hash/hash.module";
import { OsModule } from "src/utils/os/os.module";
import { ClipController } from "./clip.controller";
import { ClipRepository } from "./clip.repository";
import { ClipService } from "./clip.service";

describe("ClipController", () => {
  let controller: ClipController;

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
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
