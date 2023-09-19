import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Clip, ClipDocument } from "src/schema/clips.schema";
import { Room, RoomDocument } from "src/schema/rooms.schema";
import { CreateClipDto } from "./dto/create-clip.dto";

@Injectable()
export class ClipRepository {
  constructor(
    @InjectModel(Clip.name) private clipModel: Model<ClipDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>
  ) {}

  async create(createClipDto: CreateClipDto) {
    const createClip = new this.clipModel(Object.assign(createClipDto));
    const created = await createClip.save();
    return created;
  }

  findAll() {
    return this.clipModel.find().exec();
  }

  findOne(id: string) {
    return this.clipModel.findById(id).exec();
  }

  remove(id: string) {
    return this.clipModel.findByIdAndRemove(id).exec();
  }
}
