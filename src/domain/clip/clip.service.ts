import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import * as path from "path";
import * as fs from "fs";
import { S3Repository } from "src/shared/aws/s3/s3.repository";
import { RoomRepository } from "src/domain/room/room.repository";
import { ClipRepository } from "./clip.repository";
import { ClipDto } from "./dto/clip.dto";
import { ClipResponse } from "./dto/response/clip.response.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";
import { ResponseMessage } from "src/resources/message.ko";
import { CreateClipResponse } from "./dto/response/create-clip.response.dto";
import { DeleteClipRequest } from "./dto/request/delete-clip.request.dto";
import { FfmpegService } from "src/domain/clip/feature/ffmpeg/ffmpeg.service";
import { OsHelper } from "src/shared/os/os.helper";
import { Cron } from "@nestjs/schedule";
import { Mutex } from "async-mutex";

@Injectable()
export class ClipService {
  readonly pendingClipList: ClipDto[] = [];
  readonly failedClipIdSet = new Set();

  private mutex = new Mutex();
  constructor(
    private readonly clipRepository: ClipRepository,
    private readonly roomRepository: RoomRepository,
    private readonly s3Repository: S3Repository,
    private readonly ffmpegService: FfmpegService,
    private readonly osHelper: OsHelper
  ) {}

  async create(
    createClipDto: CreateClipRequest,
    file: any
  ): Promise<CreateClipResponse> {
    const splitted = file.originalname.split(".");
    const extension = splitted[splitted.length - 1];

    const videoS3Key: string = `videos/${
      createClipDto.roomId
    }/${this.generateCurrentWithRandom()}.${extension}`;

    const createClipPromise: Promise<ClipDto> = this.clipRepository
      .create(createClipDto, extension, videoS3Key)
      .then(async (clipDto) => {
        await this.roomRepository.addClip(createClipDto.roomId, clipDto.clipId);
        return clipDto;
      });

    const uploadPromise: Promise<any> = this.s3Repository
      .uploadFile({
        key: videoS3Key,
        buffer: file.buffer,
      })
      .catch((err) => {
        Logger.error(`[ClipService/create] failed to uploadFile`);
        Logger.error(`[ClipService/create] ${err}`);
        throw new HttpException(
          ResponseMessage.CLIP_CREATE_FAIL_UPLOAD_VIDEO,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
    const clipDto = await Promise.all([createClipPromise, uploadPromise])
      .then(([clipDto, _]) => {
        this.pendingClipList.push(clipDto);
        Logger.debug(
          `[ClipService/create] add ${clipDto.clipId} to ${this.pendingClipList
            .map((it) => it.clipId)
            .join(", ")})`
        );
        return clipDto;
      })
      .catch((err) => {
        this.clipRepository.remove(clipDto.clipId);
        if (err instanceof HttpException) {
          throw err;
        }
        Logger.error(`[ClipService/create] ${err}`);
        throw new HttpException(
          ResponseMessage.CLIP_CREATE_FAIL_CREATE_CLIP,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });

    return new CreateClipResponse(clipDto);
  }

  async findAll(): Promise<ClipDto[]> {
    return await this.clipRepository.findAll();
  }

  async findOne(id: string): Promise<ClipResponse> {
    const clipDto = await this.clipRepository.findOne(id);
    let signedUrl: string;
    try {
      const thumbKey = clipDto.compactedVideoS3Key;
      if (await this.s3Repository.existsInS3(thumbKey)) {
        signedUrl = await this.s3Repository.getPresignedUrl(thumbKey);
      } else {
        signedUrl = await this.s3Repository.getPresignedUrl(clipDto.videoS3Key);
      }
    } catch (err) {
      signedUrl = await this.s3Repository.getPresignedUrl(clipDto.videoS3Key);
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

  @Cron("*/15 * * * * *") // 초, 분, 시간, 일, 월, 요일 순서입니다.
  private async scheduleForCompacting() {
    if (this.mutex.isLocked) {
      return;
    }
    const release = await this.mutex.acquire();
    Logger.debug(
      `[ClipService/doCompat] start this.pendingClipList size = ${this.pendingClipList.length}`
    );
    let target: ClipDto = null;
    if (this.pendingClipList.length > 0) {
      target = this.pendingClipList.pop();
    } else {
      const clips = await this.findAll();
      target = clips
        .filter((it) => it.compactedVideoS3Key == null)
        .filter((it) => !this.failedClipIdSet.has(it))[0];
      Logger.debug(`[ClipService/doCompat] get empty clip ${target.clipId})`);
    }
    if (target != null) {
      Logger.debug(`[ClipService/doCompat] target = ${target.clipId}`);
      await this.createCompactedVideo(target)
        .then((it) => {
          return;
        })
        .catch((err) => {
          this.failedClipIdSet.add(target.clipId);
          Logger.error(
            `[ClipService/doCompat] failed to create compacted video ${target.clipId}`
          );
          Logger.error(`[ClipService/doCompat] ${err}`);
        });
    }
    release();
    return;
  }

  private async createCompactedVideo(clipDto: ClipDto) {
    return await this.osHelper.openTempDirectory(
      "webm",
      async (tempDir: string) => {
        Logger.debug(
          `[ClipService/createCompactedVideo] create temp dir ${tempDir}`
        );
        const outPath: string = path.join(
          tempDir,
          `${clipDto.clipId}_compacted.webm`
        );
        const inputFolderPath: string = path.join(
          tempDir,
          `${clipDto.clipId}_original`
        );

        Logger.debug(
          `[ClipService/createCompactedVideo]] download ${clipDto.videoS3Key} on ${inputFolderPath}`
        );
        const inputPath: string = await this.s3Repository.download(
          clipDto.videoS3Key,
          inputFolderPath
        );

        await this.ffmpegService.makeWebmFile(inputPath, outPath);
        Logger.debug(`[ClipService/createCompactedVideo] made webmFile`);
        const fileContent = fs.readFileSync(outPath);

        const compactedVideoS3Key: string = `videos/${
          clipDto.roomId
        }/compacted/${this.generateCurrentWithRandom()}.webm`;

        await this.s3Repository.uploadFile({
          key: compactedVideoS3Key,
          buffer: fileContent,
        });
        Logger.debug(`[ClipService/createCompactedVideo] upload webmFile`);
        await this.clipRepository.update(clipDto.clipId, {
          compactedVideoS3Key,
        });
      }
    );
  }

  private generateCurrentWithRandom(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000);

    return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}_${random}`;
  }
}
