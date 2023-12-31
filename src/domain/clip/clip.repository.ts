import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Clip, ClipDocument } from "src/shared/mongodb/schema/clips.schema";
import { HashHelper } from "src/shared/hash/hash.helper";
import { ResponseMessage } from "src/resources/message.ko";
import { ClipDto } from "./dto/clip.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";
import { ClassInfo } from "src/shared/logger/interface/ClassInfo";
import { MethodLoggerService } from "src/shared/logger/MethodLoggerService";

@Injectable()
export class ClipRepository implements ClassInfo {
  readonly logTag: string = this.constructor.name;
  private readonly logger: MethodLoggerService = new MethodLoggerService(
    Logger,
    this
  );

  constructor(
    @InjectModel(Clip.name) private readonly clipModel: Model<ClipDocument>,
    private readonly hashHelper: HashHelper
  ) {}

  async create(
    createClipDto: CreateClipRequest,
    extension: string,
    videoS3Key
  ): Promise<ClipDto> {
    const hashString: string = [
      createClipDto.roomId,
      createClipDto.nickname,
    ].join("/");
    const password = await this.hashHelper.createHash(hashString, 10);

    const createClip: any = await this.clipModel.create(
      Object.assign({ extension, password, videoS3Key }, createClipDto)
    );
    return new ClipDto(
      createClip._id.toString(),
      createClip.roomId,
      createClip.nickname,
      createClip.message,
      createClip.isPublic,
      createClip.extension,
      createClip.password,
      createClip.videoS3Key,
      createClip.compactedVideoS3Key
    );
  }

  async findAll(): Promise<ClipDto[]> {
    const result = await this.clipModel.find().exec();
    return result.map((clip: any) => {
      return new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.message,
        clip.isPublic,
        clip.extension,
        clip.password,
        clip.videoS3Key,
        clip.compactedVideoS3Key
      );
    });
  }

  async findOne(id: string): Promise<ClipDto> {
    const clip: any = await this.clipModel.findById(id).exec();
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
      clip.password,
      clip.videoS3Key,
      clip.compactedVideoS3Key
    );
    return clipDto;
  }

  async update(clipId: string, input: Partial<ClipDto>): Promise<ClipDto> {
    const clip: any = await this.clipModel.findById(clipId);
    if (clip == null) {
      throw `Clip(${clipId}) is not existed`;
    }
    if (input.nickname != null) {
      clip.compactedVideoS3Key = input.nickname;
    }
    if (input.message != null) {
      clip.compactedVideoS3Key = input.message;
    }
    if (input.extension != null) {
      clip.compactedVideoS3Key = input.extension;
    }
    if (input.compactedVideoS3Key != null) {
      clip.compactedVideoS3Key = input.compactedVideoS3Key;
    }
    if (input.videoS3Key != null) {
      clip.compactedVideoS3Key = input.videoS3Key;
    }
    const result = await clip.save();

    const clipDto = new ClipDto(
      result._id.toString(),
      result.roomId,
      result.nickname,
      result.message,
      result.isPublic,
      result.extension,
      result.password,
      result.videoS3Key,
      result.compactedVideoS3Key
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
        this.logger.error("remove", err);
      }
      return false;
    }
  }
}
