import { S3Repository } from "src/shared/aws/s3/s3.repository";
import { RoomRepository } from "src/domain/room/room.repository";
import { ClipRepository } from "./clip.repository";
import { ClipService } from "./clip.service";
import { CreateClipResponse } from "./dto/response/create-clip.response.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";
import { DeleteClipRequest } from "./dto/request/delete-clip.request.dto";
import { FfmpegService } from "src/domain/clip/feature/ffmpeg/ffmpeg.service";
import { ClipDto } from "./dto/clip.dto";
import { RoomDto } from "src/domain/room/dto/room.dto";
import { OsModule } from "src/shared/os/os.module";
import { Test, TestingModule } from "@nestjs/testing";

describe("ClipService", () => {
  let service: ClipService;

  const mockClipRepository: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockRoomRepository: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    addClip: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OsModule],
      providers: [
        ClipService,
        {
          provide: ClipRepository,
          useValue: mockClipRepository,
        },
        {
          provide: RoomRepository,
          useValue: mockRoomRepository,
        },
        {
          provide: S3Repository,
          useValue: {
            uploadFile: jest
              .fn()
              .mockResolvedValue(Promise.resolve("video_url")),
            getPresignedUrl: jest
              .fn()
              .mockResolvedValue(Promise.resolve("video_url")),
          },
        },
        {
          provide: FfmpegService,
          useValue: {
            makeWebmFile: jest.fn().mockResolvedValue(Promise.resolve(true)),
          },
        },
      ],
    }).compile();
    service = module.get<ClipService>(ClipService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("클립 정보 전체 조회", () => {
    it("조회된 데이터는 array 타입 ", async () => {
      // Arrange
      jest
        .spyOn(mockClipRepository, "findAll")
        .mockResolvedValue(Promise.resolve([]));

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe("클립 생성 테스트", () => {
    // TODO update bug
    it("[1] 클립 생성", async () => {
      // Arrange
      const roomId = "roomId";
      const input = new CreateClipRequest(roomId, "nickname", "message", true);
      // TODO clipRepository의 리턴 타입은 무엇이고 mock 객체 못만드나?
      const mockClipDto: ClipDto = new ClipDto(
        "testId",
        "",
        "",
        "",
        false,
        "mp4",
        ""
      );
      jest
        .spyOn(mockClipRepository, "create")
        .mockResolvedValue(Promise.resolve(mockClipDto));
      jest
        .spyOn(mockRoomRepository, "addClip")
        .mockResolvedValue(
          Promise.resolve(new RoomDto("", "", "", "", null, []))
        );

      // Act
      const result: CreateClipResponse = await service.create(input, {
        originalname: "test.mp4",
      });

      // Assert
      expect(result).toBeInstanceOf(CreateClipResponse);
      expect(result.extension).toEqual("mp4");
    });
  });

  describe("클립 삭제 테스트", () => {
    it("성공 케이스", async () => {
      // Arrange
      const clipId = "clipId";
      const password = "password";
      const input = new DeleteClipRequest(password);

      jest.spyOn(mockClipRepository, "findOne").mockImplementation((id) => {
        return id == clipId
          ? Promise.resolve({ password })
          : Promise.resolve(null);
      });

      jest
        .spyOn(mockClipRepository, "remove")
        .mockResolvedValue(Promise.resolve(true));

      // Act
      const result = await service.remove(clipId, input);

      // Assert
      expect(result).toBeTruthy();
    });
  });
});
