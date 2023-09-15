import { Injectable } from "@nestjs/common";
import { S3Repository } from "src/aws/s3/s3.repository";
import { ClipRepository } from "./clip.repository";
import { CreateClipDto } from "./dto/create-clip.dto";
import { UpdateClipDto } from "./dto/update-clip.dto";

@Injectable()
export class ClipService {
  constructor(
    private readonly clipRepository: ClipRepository,
    private readonly s3Respository: S3Repository
  ) {}

  async create(createClipDto: CreateClipDto, file) {
    console.log(typeof file);
    const key = `videos/${createClipDto.roomId}/${
      Date.now() + file.originalname
    }`;
    const buffer = file.buffer;
    const video_url = await this.s3Respository.uploadFile({
      key,
      buffer,
    });
    return this.clipRepository.create(createClipDto, video_url);
  }

  findAll() {
    return this.clipRepository.findAll();
  }

  findOne(id: string) {
    return this.clipRepository.findOne(id);
  }

  update(id: string, updateClipDto: UpdateClipDto) {
    return `This action updates a #${id} clip`;
  }

  remove(id: string) {
    return this.clipRepository.remove(id);
  }
}
