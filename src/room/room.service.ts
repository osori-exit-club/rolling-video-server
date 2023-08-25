import { Injectable } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { RoomRepository } from "./room.repository";

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  create(createRoomDto: CreateRoomDto) {
    return this.roomRepository.create(createRoomDto);
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
