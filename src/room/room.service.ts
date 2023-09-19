import { Injectable } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { RoomRepository } from "./room.repository";

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  async create(createRoomDto: CreateRoomDto) {
    const room = await this.roomRepository.create(createRoomDto);

    return room;
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
