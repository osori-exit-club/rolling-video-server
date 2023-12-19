import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Clip, ClipDocument } from "src/schema/clips.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";

@Injectable()
export class ClipRepository {
  constructor(
    @InjectModel(Clip.name) private readonly clipModel: Model<ClipDocument>,
    private readonly hashHelper: HashHelper
  ) {}

  async create(createClipDto: CreateClipRequest, extension: string) {
    const hashString: string = [
      createClipDto.roomId,
      createClipDto.nickname,
    ].join("/");
    const password = await this.hashHelper.createHash(hashString, 10);

    const createClip = new this.clipModel(
      Object.assign({ extension: extension, password: password }, createClipDto)
    );
    return createClip.save();
  }

  findAll() {
    return this.clipModel.find().exec();
  }

  findOne(id: string) {
    return this.clipModel.findById(id).exec();
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.clipModel.findByIdAndDelete(id).exec();
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
