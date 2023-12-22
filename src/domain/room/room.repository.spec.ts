import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { HashHelper } from "src/shared/hash/hash.helper";
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
import { RoomRepository } from "./room.repository";
import { Clip } from "src/model/mongodb/schema/clips.schema";
import { Room } from "src/model/mongodb/schema/rooms.schema";

class MockRoomModel {
  private readonly arrayDB: any[] = [1, 2, 3, 4, 5].map((idx) => {
    return {
      _id: `room-${idx}`,
      name: "name",
      passwordHashed: "passwordHashed",
      recipient: "recipient",
      dueDate: Date(),
      clips: [],
      clipIds: [`clip${idx}1`, `clip${idx}2`, `clip${idx}3`],
    };
  });

  async create(input: any) {
    return {
      _id: "roomId",
      name: input.name,
      passwordHashed: input.passwordHashed || null,
      recipient: input.recipient,
      dueDate: input.dueDate || new Date(),
      clips: input.clips || [],
      clipIds: input.clipIds || [],
    };
  }
  find() {
    return {
      exec: jest.fn().mockResolvedValue(this.arrayDB),
    };
  }

  findById(id: string) {
    const item = this.arrayDB.find((it) => it._id == id);
    return Object.assign(item, {
      exec: jest.fn().mockResolvedValue(item),
      save: jest.fn().mockImplementation(async () => item),
    });
  }
  findByIdAndDelete(id: string) {
    const item = this.arrayDB.find((it) => it._id == id);
    return {
      exec: jest.fn().mockResolvedValue(item),
    };
  }
}

class MockClipModel {
  private readonly arrayDB: any[] = [1, 2, 3, 4, 5].map((idx) => {
    return {
      _id: `clip-${idx}`,
      roomId: "roomId",
      nickname: "nickname",
      message: "message",
      isPublic: true,
      extesntion: "mp4",
      password: "generated hash code",
    };
  });

  async create(input: any) {
    return {
      _id: "clipId",
      roomId: input.roomId,
      nickname: input.nickname,
      message: input.message,
      isPublic: input.isPublic,
      extesntion: input.extension,
      password: input.password,
    };
  }
  find() {
    return {
      exec: jest.fn().mockResolvedValue(this.arrayDB),
    };
  }

  findById(id: string) {
    const result = this.arrayDB.find((it) => it._id == id);
    return {
      exec: jest.fn().mockResolvedValue(result),
    };
  }
  findByIdAndDelete(id: string) {
    const result: any = this.arrayDB.find((it) => it._id == id);
    return {
      exec: jest.fn().mockResolvedValue(result),
    };
  }
}

describe("RoomRepository", () => {
  let repository: RoomRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        RoomRepository,
        {
          provide: HashHelper,
          useValue: {
            createHash: jest
              .fn()
              .mockImplementation(async (password) => password),
          },
        },
        {
          provide: getModelToken(Room.name),
          useClass: MockRoomModel,
        },
        {
          provide: getModelToken(Clip.name),
          useClass: MockClipModel,
        },
      ],
    }).compile();

    repository = module.get<RoomRepository>(RoomRepository);
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
      const input = new CreateRoomRequest("방이름", "1234", "받는사람");

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
      const input = "room-1";
      // Act
      const result = await repository.findOne(input);
      // Assert;
      expect(result.roomId).toEqual(input);
    });
  });

  describe("방 삭제 테스트", () => {
    it("[1] 방 삭제", async () => {
      // Arrange;
      const id = "room-5";
      // Act
      const result = await repository.remove(id);
      // Assert;
      expect(result).toBeTruthy();
    });
  });

  describe("클립 추가", () => {
    it("클립 추가 ", async () => {
      // Arrange
      const roomId = "room-1";
      // Act
      const result = await repository.addClip(roomId, "newClipId");
      // Assert
      const lastClipId = result.clipIds[result.clipIds.length - 1];
      expect(lastClipId).toEqual("newClipId");
    });
  });
});
