import { Injectable } from "@nestjs/common";
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

  async create(
    createClipDto: CreateClipRequest,
    extension: string,
    decorate: (clip: any) => Promise<{ playtime: string }>
  ) {
    const hashString: string = [
      createClipDto.roomId,
      createClipDto.nickname,
    ].join("/");
    const password = await this.hashHelper.createHash(hashString, 10);

    const createClip = new this.clipModel(
      Object.assign({ extension: extension, password: password }, createClipDto)
    );
    const created = await createClip.save();
    const { playtime } = await decorate(created);
    created.playtime = playtime;
    await created.save();
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
