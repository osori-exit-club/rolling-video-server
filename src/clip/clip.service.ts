import { Injectable } from "@nestjs/common";
import { ClipRepository } from "./clip.repository";
import { CreateClipDto } from "./dto/create-clip.dto";
import { UpdateClipDto } from "./dto/update-clip.dto";

@Injectable()
export class ClipService {
  constructor(private readonly clipRepository: ClipRepository) {}

  create(createClipDto: CreateClipDto) {
    return this.clipRepository.create(createClipDto);
  }

  findAll() {
    return `This action returns all clip`;
  }

  findOne(id: string) {
    return `This action returns a #${id} clip`;
  }

  update(id: string, updateClipDto: UpdateClipDto) {
    return `This action updates a #${id} clip`;
  }

  remove(id: string) {
    return `This action removes a #${id} clip`;
  }
}
