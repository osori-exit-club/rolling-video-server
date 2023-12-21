import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClipDto } from "src/clip/dto/clip.dto";
import { Room, RoomDocument } from "src/schema/rooms.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
import { UpdateRoomRequest } from "./dto/request/update-room.request.dto";
import { RoomDto } from "./dto/room.dto";

@Injectable()
export class RoomRepository {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private hashHelper: HashHelper
  ) {}

  async create(createRoomDto: CreateRoomRequest) {
    let obj: any = createRoomDto;
    if (createRoomDto.password) {
      const passwordHahed = await this.hashHelper.createHash(
        createRoomDto.password
      );
      obj["passwordHashed"] = passwordHahed;
      delete obj.password;
    }
    const createdRoom = new this.roomModel(obj);
    return createdRoom.save();
  }

  async addClip(roomId: string, clip: any) {
    const room = await this.roomModel.findById(roomId);
    if (room == null) {
      throw `Room(${roomId}) is not existed`;
    }
    room.clips.push(clip);
    return await room.save();
  }

  findAll() {
    return this.roomModel.find().exec();
  }

  findOne(id: string) {
    return this.roomModel.findById(id).exec();
  }

  async update(
    id: string,
    updateRoomRequest: UpdateRoomRequest
  ): Promise<RoomDto> {
    let room = await this.roomModel.findById(id);
    if (room == null) {
      throw `Room(${id}) is not existed`;
    }
    if (updateRoomRequest.name) {
      room.name = updateRoomRequest.name;
    }
    if (updateRoomRequest.recipient) {
      room.recipient = updateRoomRequest.recipient;
    }
    room = await room.save();

    const roomDto = new RoomDto(
      room._id.toString(),
      room.name,
      room.passwordHashed,
      room.recipient,
      new Date(+room.dueDate),
      room.clips.map((clip) => {
        return new ClipDto(
          clip._id.toString(),
          clip.roomId,
          clip.nickname,
          clip.message,
          clip.isPublic,
          clip.extension,
          clip.password
        );
      })
    );
    return roomDto;
  }

  /**
   *
   * @return objectId if room exists else null
   */
  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.roomModel.findByIdAndDelete(id).exec();
      if (result == null) {
        return false;
      }
      return true;
    } catch (err) {
      if (err.__proto__.toString() != "CastError") {
        Logger.error(err);
      }
      return false;
    }
  }
}
