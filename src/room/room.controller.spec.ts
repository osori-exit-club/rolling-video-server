import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Room } from "src/schema/rooms.schema";
import { RoomController } from "./room.controller";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";

describe("RoomController", () => {
  let controller: RoomController;
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
