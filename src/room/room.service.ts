import { Injectable } from "@nestjs/common";
import { ClipDto } from "src/clip/dto/clip.dto";
import { CreateRoomDto } from "./dto/create-room.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomRepository } from "./room.repository";

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  async create(createRoomDto: CreateRoomDto): Promise<RoomDto> {
    const room = await this.roomRepository.create(createRoomDto);

    return new RoomDto(
      room._id.toString(),
      room.name,
      room.password,
      room.recipient,
      room.dueDate,
      room.clips.map((clip) => {
        return new ClipDto(
          clip._id.toString(),
          clip.roomId,
          clip.nickname,
          clip.isPublic,
          clip.videoUrl
        );
      })
    );
  }

  findAll() {
    return this.roomRepository.findAll();
  }

  findOne(id: string) {
    return this.roomRepository.findOne(id);
  }

  remove(id: string) {
    return this.roomRepository.remove(id);
  }
}
