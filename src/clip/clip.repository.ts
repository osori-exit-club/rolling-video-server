import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Clip, ClipDocument } from "src/schema/clips.schema";
import { HashHelper } from "src/utils/hash/hash.helper";
import { CreateClipDto } from "./dto/create-clip.dto";

@Injectable()
export class ClipRepository {
  constructor(
    @InjectModel(Clip.name) private readonly clipModel: Model<ClipDocument>,
    private readonly hashHelper: HashHelper
  ) {}

  async create(createClipDto: CreateClipDto, extension: string) {
    const hashString: string = [
      createClipDto.roomId,
      createClipDto.nickname,
    ].join("/");
    const password = await this.hashHelper.createHash(hashString, 10);

    const createClip = new this.clipModel(
      Object.assign({ extension: extension, password: password }, createClipDto)
    );
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
