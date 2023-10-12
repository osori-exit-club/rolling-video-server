import { Injectable } from "@nestjs/common";
import { ClipDto } from "src/clip/dto/clip.dto";
import { HashHelper } from "src/utils/hash/hash.helper";
import { CreateRoomDto } from "./dto/create-room.dto";
import { DeleteRoomResponseDto } from "./dto/delete-room-response.dto";
import { DeleteRoomDto } from "./dto/delete-room.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomRepository } from "./room.repository";

@Injectable()
export class RoomService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly hashHelper: HashHelper
  ) {}

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

  async remove(
    id: string,
    deleteRoomDto: DeleteRoomDto
  ): Promise<DeleteRoomResponseDto> {
    let room;
    try {
      room = await this.roomRepository.findOne(id);
    } catch (err) {
      return new DeleteRoomResponseDto(false, "존재하지 않는 id 입니다.");
    }
    if (room == null) {
      return new DeleteRoomResponseDto(false, "존재하지 않는 id 입니다.");
    }
    const isMatched = await this.hashHelper.isMatch(
      deleteRoomDto.password,
      room.passwordHashed
    );
    if (isMatched == false) {
      return new DeleteRoomResponseDto(false, "잘못된 패스워드 입니다");
    }
    const removedId = await this.roomRepository.remove(id);
    if (removedId != null) {
      return new DeleteRoomResponseDto(true, "삭제에 성공 했습니다.");
    }
    return new DeleteRoomResponseDto(false, "삭제에 실패 했습니다.");
  }
}
