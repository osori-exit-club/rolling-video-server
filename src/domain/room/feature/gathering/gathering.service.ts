import * as fs from "fs";
import { Injectable, Logger } from "@nestjs/common";
import { S3Repository } from "src/shared/aws/s3/s3.repository";
import { CompressHelper } from "src/domain/room/feature/compress/compress.helper";
import { Mutex } from "async-mutex";
import { ClassInfo } from "src/shared/logger/interface/ClassInfo";
import { MethodLoggerService } from "src/shared/logger/MethodLoggerService";
import { FfmpegService } from "src/shared/ffmpeg/ffmpeg.service";

@Injectable()
export class GatheringService implements ClassInfo {
  readonly logTag: string = this.constructor.name;
  private readonly logger: MethodLoggerService = new MethodLoggerService(
    Logger,
    this
  );

  private mutex = new Mutex();
  constructor(
    private readonly s3Repository: S3Repository,
    private readonly compressHelper: CompressHelper,
    private readonly ffmpegService: FfmpegService
  ) {}

  async gather(
    s3key: string,
    paramsList: { key: string; nickname: string; message: string }[],
    downloadDir: string,
    outFilePath: string
  ) {
    const downloadDirOriginal: string = downloadDir + "_original";
    const release = await this.mutex.acquire();
    try {
      const promiseList = paramsList.map(({ key }) => {
        return this.s3Repository.download(key, downloadDirOriginal);
      });
      this.logger.debug("gather", `start download ${promiseList}`);
      const downloadedList = await Promise.all(promiseList);
      this.logger.debug("gather", "start compress");
      for (let i = 0; i < downloadedList.length; i++) {
        const outPath: string = downloadedList[i];
        const { nickname, message } = paramsList[i];
        const splitted = outPath.split("/");
        const fileName: string = splitted[splitted.length - 1];
        await this.ffmpegService.convertVideo(
          outPath,
          nickname,
          message,
          `${downloadDir}/${fileName}`
        );
      }
      await this.compressHelper.compress(downloadDir, outFilePath);
      const fileContent: Buffer = fs.readFileSync(outFilePath);
      const outPath: string = await this.s3Repository.uploadFile({
        buffer: fileContent,
        key: s3key,
      });
      return outPath;
    } finally {
      release();
    }
  }
}
