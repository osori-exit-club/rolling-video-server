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
import { FfmpegService } from "src/clip/feature/ffmpeg/ffmpeg.service";
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

    const clipDto: ClipDto = await this.clipRepository.create(
      createClipDto,
      extension
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
      });
    // 압축 로직이 서버 부하를 일으키는 것으로 추정하여 잠시 disabled
    // .then((_) => {
    //   return this.createCompactedVideo(clipDto);
    // })
    // .catch((err) => {
    //   Logger.error(`failed to create compacted video ${clipDto.clipId}`);
    //   Logger.error(err);
    // });
    this.roomRepository.addClip(createClipDto.roomId, clipDto.clipId);
    return new CreateClipResponse(clipDto);
  }

  async createCompactedVideo(clipDto: ClipDto) {
    return await this.osHepler.openTempDirectory(
      "webm",
      async (tempDir: string) => {
        Logger.debug(`[compact process] create temp dir ${tempDir}`);
        const outPath: string = path.join(
          tempDir,
          `${clipDto.clipId}_compacted.webm`
        );
        const inputFolderPath: string = path.join(
          tempDir,
          `${clipDto.clipId}_original`
        );

        Logger.debug(
          `[compact process] download ${clipDto.getS3Key()} on ${inputFolderPath}`
        );
        const inputPath = await this.s3Respository.download(
          clipDto.getS3Key(),
          inputFolderPath
        );

        await this.ffmpegService.makeWebmFile(inputPath, outPath);
        Logger.debug(`[compact process] made webmFile`);
        const fileContent = fs.readFileSync(outPath);
        await this.s3Respository.uploadFile({
          key: clipDto.getS3ThumbKey(),
          buffer: fileContent,
        });
        Logger.debug(`[compact process] upload webmFile`);
      }
    );
  }

  async findAll(): Promise<ClipDto[]> {
    return await this.clipRepository.findAll();
  }

  async findOne(id: string): Promise<ClipResponse> {
    const clipDto = await this.clipRepository.findOne(id);
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
}
