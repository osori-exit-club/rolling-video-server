import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Clip } from "src/schema/clips.schema";
import { Room } from "src/schema/rooms.schema";
import { ClipRepository } from "./clip.repository";
import { ClipService } from "./clip.service";

describe("ClipService", () => {
  let service: ClipService;

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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
