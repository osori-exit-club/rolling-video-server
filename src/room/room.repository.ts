import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, MongooseError } from "mongoose";
import { Room, RoomDocument } from "src/schema/rooms.schema";
import { CreateRoomDto } from "./dto/create-room.dto";
import { DeleteRoomResponseDto } from "./dto/delete-room-response.dto";

@Injectable()
export class RoomRepository {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  create(createRoomDto: CreateRoomDto) {
    const createdRoom = new this.roomModel(createRoomDto);
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

  /**
   *
   * @return objectId if room exists else null
   */
  async remove(id: string): Promise<string | null> {
    try {
      const result = await this.roomModel.findByIdAndRemove(id).exec();
      return result._id.toString();
    } catch (err) {
      if (err.__proto__.toString() != "CastError") {
        console.log(err);
      }
      return null;
    }
  }
}
