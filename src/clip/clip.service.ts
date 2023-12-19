import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import * as path from "path";
import * as fs from "fs";
import { S3Repository } from "src/aws/s3/s3.repository";
import { RoomRepository } from "src/room/room.repository";
import { ClipRepository } from "./clip.repository";
import { ClipDto } from "./dto/clip.dto";
import { ClipResponse } from "./dto/response/clip.response.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";
import { ResponseMessage } from "src/utils/message.ko";
import { CreateClipResponse } from "./dto/response/create-clip.response.dto";
import { DeleteClipRequest } from "./dto/request/delete-clip.request.dto";
import { FfmpegService } from "src/ffmpeg/ffmpeg.service";
import { OsHelper } from "src/utils/os/os.helper";

@Injectable()
export class ClipService {
  constructor(
    private readonly clipRepository: ClipRepository,
    private readonly roomRepository: RoomRepository,
    private readonly s3Respository: S3Repository,
    private readonly ffmpegService: FfmpegService,
    private readonly osHepler: OsHelper
  ) {}

  async create(
    createClipDto: CreateClipRequest,
    file: any
  ): Promise<CreateClipResponse> {
    const splitted = file.originalname.split(".");
    const extension = splitted[splitted.length - 1];
    if (!createClipDto.playtime) {
      try {
        createClipDto.playtime = await this.getPlaytime(file);
        Logger.debug(
          `[ClipService/create] update playtime as ${createClipDto.playtime}`
        );
      } catch (err) {
        Logger.error(
          `[ClipService/create] failed to get playtime ${err.message}`
        );
      }
    }

    const createClip = await this.clipRepository.create(
      createClipDto,
      extension
    );
    const clipDto = new ClipDto(
      createClip._id.toString(),
      createClip.roomId,
      createClip.nickname,
      createClip.message,
      createClip.isPublic,
      createClip.extension,
      createClip.password,
      createClip.playtime
    );
    const key: string = clipDto.getS3Key();

    await this.s3Respository
      .uploadFile({
        key,
        buffer: file.buffer,
      })
      .catch((err) => {
        Logger.error(`failed to uploadFile`);
        Logger.error(err);
        this.clipRepository.remove(clipDto.clipId);
        throw new HttpException(
          ResponseMessage.CLIP_CREATE_FAIL_UPLOAD_VIDEO,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      })
      .then((_) => {
        return this.osHepler.openTempDirectory(
          "webm",
          async (tempDir: string) => {
            Logger.debug(`[compact process] create temp dir ${tempDir}`);
            const outPath: string = path.join(tempDir, "output.webm");

            const signedUrl = await this.s3Respository.getPresignedUrl(
              clipDto.getS3Key()
            );
            Logger.debug(`[compact process] signed url ${signedUrl}`);
            await this.ffmpegService.makeWebmFile(signedUrl, outPath);
            Logger.debug(`[compact process] made webmFile`);
            const fileContent = fs.readFileSync(outPath);
            await this.s3Respository.uploadFile({
              key: clipDto.getS3ThumbKey(),
              buffer: fileContent,
            });
            Logger.debug(`[compact process] upload webmFile`);
          }
        );
      })
      .catch((err) => {
        Logger.error(`failed to create compacted video ${clipDto.clipId}`);
        Logger.error(err);
      });
    this.roomRepository.addClip(createClipDto.roomId, createClip);
    return new CreateClipResponse(clipDto);
  }

  async findAll(): Promise<ClipDto[]> {
    const result = await this.clipRepository.findAll();
    return result.map((clip) => {
      return new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.message,
        clip.isPublic,
        clip.extension,
        clip.password,
        clip.playtime
      );
    });
  }

  async findOne(id: string): Promise<ClipResponse> {
    const clip = await this.clipRepository.findOne(id);
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
      clip.playtime
    );
    let signedUrl: string;
    try {
      const thumbKey = clipDto.getS3ThumbKey();
      if (await this.s3Respository.existsInS3(thumbKey)) {
        signedUrl = await this.s3Respository.getPresignedUrl(thumbKey);
      } else {
        signedUrl = await this.s3Respository.getPresignedUrl(
          clipDto.getS3Key()
        );
      }
    } catch (err) {
      signedUrl = await this.s3Respository.getPresignedUrl(clipDto.getS3Key());
    }
    return new ClipResponse(clipDto, signedUrl);
  }

  async remove(id: string, deleteClipDto: DeleteClipRequest): Promise<boolean> {
    let clip = null;
    try {
      clip = await this.clipRepository.findOne(id);
    } catch (err) {}
    if (clip == null) {
      throw new HttpException(
        ResponseMessage.CLIP_READ_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    if (clip.password != deleteClipDto.password) {
      throw new HttpException(
        ResponseMessage.CLIP_REMOVE_FAIL_WONG_PASSWORD,
        HttpStatus.BAD_REQUEST
      );
    }
    return this.clipRepository.remove(id);
  }

  getPlaytime(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.osHepler
        .openTempDirectory("get-video-url", async (tempDir: string) => {
          Logger.debug(
            `[ClipService/getPlaytime] start with ${file.originalname} in ${tempDir}`
          );
          const tempFilePath = path.join(tempDir, file.originalname);
          const stream = fs.createWriteStream(tempFilePath);
          stream.write(file.buffer);
          stream.end();

          const playtime: string = await this.ffmpegService.getPlaytime(
            tempFilePath
          );
          Logger.debug(`[ClipService/getPlaytime] playtime is ${playtime}`);
          resolve(playtime);
        })
        .catch((err) => {
          Logger.error(
            `[ClipService/getPlaytime] fail to get playtime ${err.message}`
          );
          reject(err);
        });
    });
  }
}
