import { Injectable } from "@nestjs/common";
import { ClipDto } from "src/clip/dto/clip.dto";
import { CreateRoomDto } from "./dto/create-room.dto";
import { DeleteRoomResponseDto } from "./dto/delete-room-response.dto";
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
      room.passwordHashed,
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

  async findAll(): Promise<RoomDto[]> {
    const result = await this.roomRepository.findAll();
    return result.map((room) => {
      return new RoomDto(
        room._id.toString(),
        room.name,
        room.passwordHashed,
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
    });
  }

  async findOne(id: string): Promise<RoomDto> {
    const room = await this.roomRepository.findOne(id);
    return new RoomDto(
      room._id.toString(),
      room.name,
      room.passwordHashed,
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

  async remove(id: string): Promise<DeleteRoomResponseDto> {
    const removedId = await this.roomRepository.remove(id);
    if (removedId != null) {
      return new DeleteRoomResponseDto(true);
    }
    return new DeleteRoomResponseDto(false);
  }
}
