import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Module } from "src/aws/s3/s3.module";
import { S3Repository } from "src/aws/s3/s3.repository";
import { RoomRepository } from "src/room/room.repository";
import { Clip } from "src/schema/clips.schema";
import { Room } from "src/schema/rooms.schema";
import { HashModule } from "src/utils/hash/hash.module";
import { ClipRepository } from "./clip.repository";
import { ClipService } from "./clip.service";
import { CreateClipDto } from "./dto/create-clip.dto";

describe("ClipService", () => {
  let service: ClipService;
  let clipRepository: ClipRepository;
  let roomRepository: RoomRepository;
  let s3Repository: S3Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [S3Module, HashModule],
      providers: [
        ClipService,
        ClipRepository,
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

    service = module.get<ClipService>(ClipService);
    clipRepository = module.get<ClipRepository>(ClipRepository);
    roomRepository = module.get<RoomRepository>(RoomRepository);
    s3Repository = module.get<S3Repository>(S3Repository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("클립 정보 전체 조회", () => {
    it("조회된 데이터는 array 타입 ", async () => {
      // Arrange
      jest
        .spyOn(clipRepository, "findAll")
        .mockResolvedValue(Promise.resolve([]));

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe("클립 생성 테스트", () => {
    it("[1] 클립 생성", async () => {
      // Arrange
      const roomId = "roomId";
      const input = new CreateClipDto(roomId, "nickname", true);
      // TODO clipRepository의 리턴 타입은 무엇이고 mock 객체 못만드나?
      const mockClip: any = { _id: "testId" };
      mockClip.save = () => {};
      jest
        .spyOn(s3Repository, "uploadFile")
        .mockResolvedValue(Promise.resolve("video_url"));
      jest
        .spyOn(clipRepository, "create")
        .mockResolvedValue(Promise.resolve(mockClip));
      jest
        .spyOn(roomRepository, "addClip")
        .mockResolvedValue(Promise.resolve(mockClip));
      // Act
      const result = await service.create(input, {
        originalname: "test.mp4",
      });

      // Assert
      expect(result.videoUrl).toEqual("video_url");
    });
  });
});
