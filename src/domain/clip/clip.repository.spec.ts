import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Clip } from "src/model/mongodb/schema/clips.schema";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";
import { ClipRepository } from "./clip.repository";
import { HashHelper } from "src/shared/hash/hash.helper";

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

describe("ClipRepository", () => {
  let repository: ClipRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ClipRepository,
        {
          provide: HashHelper,
          useValue: {
            createHash: jest
              .fn()
              .mockImplementation(async (password) => password),
          },
        },
        {
          provide: getModelToken(Clip.name),
          useClass: MockClipModel,
        },
      ],
    }).compile();

    repository = module.get<ClipRepository>(ClipRepository);

    return true;
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("클립 정보 전체 조회", () => {
    it("조회된 데이터는 array 타입 ", async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(5);
    });
  });

  describe("클립 생성 테스트", () => {
    it("[1] 클립 생성 (방번호 + 닉네팀 + 공개 + 이미지) ", async () => {
      // Arrange
      const input = new CreateClipRequest(
        "roomId",
        "nickname",
        "message",
        true
      );

      // Act
      const result = await repository.create(input, "mp4");

      // Assert
      Object.keys(input).forEach((key) => {
        expect(result[key]).toEqual(input[key]);
      });
      expect(result.password).toBeDefined();
    });

    it("[2] 클립 생성 (방번호 + 닉네팀 + 비공개 + 이미지) ", async () => {
      // Arrange
      const input = new CreateClipRequest(
        "roomId",
        "nickname",
        "message",
        false
      );

      // Act
      const result = await repository.create(input, "mp4");

      // Assert
      Object.keys(input).forEach((key) => {
        expect(result[key]).toEqual(input[key]);
      });
      expect(result.password).toBeDefined();
    });
  });

  describe("클립 조회 테스트", () => {
    it("[1] 클립 조회", async () => {
      // Arrange;
      const id: string = "clip-1";

      // Act
      const result = await repository.findOne(id);

      // Assert;
      expect(result.clipId).toEqual(id);
    });
  });

  describe("클립 삭제 테스트", () => {
    it("[1] 클립 삭제", async () => {
      // Arrange;
      const input: string = "clip-5";

      // Act
      const result = await repository.remove(input);

      // Assert;
      expect(result).toBeTruthy();
    });
  });
});
