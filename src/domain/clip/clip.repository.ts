import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Clip, ClipDocument } from "src/shared/mongodb/schema/clips.schema";
import { HashHelper } from "src/shared/hash/hash.helper";
import { ResponseMessage } from "src/resources/message.ko";
import { ClipDto } from "./dto/clip.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";

@Injectable()
export class ClipRepository {
  constructor(
    @InjectModel(Clip.name) private readonly clipModel: Model<ClipDocument>,
    private readonly hashHelper: HashHelper
  ) {}

  async create(
    createClipDto: CreateClipRequest,
    extension: string
  ): Promise<ClipDto> {
    const hashString: string = [
      createClipDto.roomId,
      createClipDto.nickname,
    ].join("/");
    const password = await this.hashHelper.createHash(hashString, 10);

    const createClip: any = await this.clipModel.create(
      Object.assign({ extension: extension, password: password }, createClipDto)
    );
    return new ClipDto(
      createClip._id.toString(),
      createClip.roomId,
      createClip.nickname,
      createClip.message,
      createClip.isPublic,
      createClip.extension,
      createClip.password
    );
  }

  async findAll(): Promise<ClipDto[]> {
    const result = await this.clipModel.find().exec();
    return result.map((clip) => {
      return new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.message,
        clip.isPublic,
        clip.extension,
        clip.password
      );
    });
  }

  async findOne(id: string): Promise<ClipDto> {
    const clip = await this.clipModel.findById(id).exec();
    if (clip == null) {
      throw new HttpException(
        ResponseMessage.CLIP_READ_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    const clipDto = new ClipDto(
      clip._id.toString(),
      clip.roomId,
      clip.nickname,
      clip.message,
      clip.isPublic,
      clip.extension,
      clip.password
    );
    return clipDto;
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
