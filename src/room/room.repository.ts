import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room, RoomDocument } from "src/schema/rooms.schema";
import { CreateRoomDto } from "./dto/create-room.dto";

@Injectable()
export class RoomRepository {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  create(createRoomDto: CreateRoomDto) {
    const createdRoom = new this.roomModel(createRoomDto);
    return createdRoom.save();
  }

  findAll() {
    return this.roomModel.find().exec();
  }

  findOne(id: string) {
    return this.roomModel.findById(id).exec();
  }

  remove(id: string) {
    return this.roomModel.findByIdAndRemove(id).exec();
  }
}
