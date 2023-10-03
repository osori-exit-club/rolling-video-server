import { Injectable } from "@nestjs/common";
import { S3Repository } from "src/aws/s3/s3.repository";
import { RoomRepository } from "src/room/room.repository";
import { ClipRepository } from "./clip.repository";
import { ClipDto } from "./dto/clip.dto";
import { CreateClipDto } from "./dto/create-clip.dto";
import { UpdateClipDto } from "./dto/update-clip.dto";

@Injectable()
export class ClipService {
  constructor(
    private readonly clipRepository: ClipRepository,
    private readonly roomRepository: RoomRepository,
    private readonly s3Respository: S3Repository
  ) {}

  async create(createClipDto: CreateClipDto, file: any): Promise<ClipDto> {
    const clip = await this.clipRepository.create(createClipDto);
    const splitted = file.originalname.split(".");
    const ext = splitted[splitted.length - 1];
    const key = `videos/${createClipDto.roomId}/${clip.id}.${ext}`;
    const buffer = file.buffer;
    const video_url = await this.s3Respository.uploadFile({
      key,
      buffer,
    });
    clip.videoUrl = video_url;
    await clip.save();
    this.roomRepository.addClip(createClipDto.roomId, clip);
    return new ClipDto(
      clip._id.toString(),
      clip.roomId,
      clip.nickname,
      clip.isPublic,
      clip.videoUrl
    );
  }

  async findAll(): Promise<ClipDto[]> {
    const result = await this.clipRepository.findAll();
    return result.map((clip) => {
      return new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.isPublic,
        clip.videoUrl
      );
    });
  }

  async findOne(id: string): Promise<ClipDto> {
    const clip = await this.clipRepository.findOne(id);
    return new ClipDto(
      clip._id.toString(),
      clip.roomId,
      clip.nickname,
      clip.isPublic,
      clip.videoUrl
    );
  }

  update(id: string, updateClipDto: UpdateClipDto) {
    return `This action updates a #${id} clip`;
  }

  remove(id: string) {
    return this.clipRepository.remove(id);
  }
}
