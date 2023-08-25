import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Clip } from "src/schema/clips.schema";
import { Room } from "src/schema/rooms.schema";
import { ClipController } from "./clip.controller";
import { ClipRepository } from "./clip.repository";
import { ClipService } from "./clip.service";

describe("ClipController", () => {
  let controller: ClipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClipController],
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

    controller = module.get<ClipController>(ClipController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
