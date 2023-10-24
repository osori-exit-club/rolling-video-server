import { Injectable } from "@nestjs/common";
import { S3Repository } from "src/aws/s3/s3.repository";
import { RoomRepository } from "src/room/room.repository";
import { ClipRepository } from "./clip.repository";
import { ClipDto } from "./dto/clip.dto";
import { ClipResponseDto } from "./dto/clip-response.dto";
import { CreateClipDto } from "./dto/create-clip.dto";

@Injectable()
export class ClipService {
  constructor(
    private readonly clipRepository: ClipRepository,
    private readonly roomRepository: RoomRepository,
    private readonly s3Respository: S3Repository
  ) {}

  async create(
    createClipDto: CreateClipDto,
    file: any
  ): Promise<ClipResponseDto> {
    const splitted = file.originalname.split(".");
    const extension = splitted[splitted.length - 1];
    const clip = await this.clipRepository.create(createClipDto, extension);

    const clipDto = new ClipDto(
      clip._id.toString(),
      clip.roomId,
      clip.nickname,
      clip.isPublic,
      clip.extension
    );

    await this.s3Respository.uploadFile({
      key: clipDto.getS3Key(),
      buffer: file.buffer,
    });

    this.roomRepository.addClip(createClipDto.roomId, clip);
    const signedUrl: string = await this.s3Respository.getPresignedUrl(
      clipDto.getS3Key()
    );
    return new ClipResponseDto(clipDto, signedUrl);
  }

  async findAll(): Promise<ClipDto[]> {
    const result = await this.clipRepository.findAll();
    return result.map((clip) => {
      return new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.isPublic,
        clip.extension
      );
    });
  }

  async findOne(id: string): Promise<ClipResponseDto> {
    const clip = await this.clipRepository.findOne(id);
    const clipDto = new ClipDto(
      clip._id.toString(),
      clip.roomId,
      clip.nickname,
      clip.isPublic,
      clip.extension
    );
    const signedUrl: string = await this.s3Respository.getPresignedUrl(
      clipDto.getS3Key()
    );
    return new ClipResponseDto(clipDto, signedUrl);
  }

  remove(id: string) {
    return this.clipRepository.remove(id);
  }
}
