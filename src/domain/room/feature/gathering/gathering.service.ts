import * as fs from "fs";
import { Injectable, Logger } from "@nestjs/common";
import { S3Repository } from "src/shared/aws/s3/s3.repository";
import { CompressHelper } from "src/domain/room/feature/compress/compress.helper";
import { Mutex } from "async-mutex";
import { Loggable } from "src/shared/logger/interface/Loggable";

@Injectable()
export class GatheringService implements Loggable {
  readonly logTag: string = this.constructor.name;

  private mutex = new Mutex();
  constructor(
    private readonly s3Repository: S3Repository,
    private readonly compressHelper: CompressHelper
  ) {}

  async gather(
    s3key: string,
    s3PathList: string[],
    downloadDir: string,
    outFilePath: string
  ) {
    const release = await this.mutex.acquire();
    try {
      const promiseList = s3PathList.map((key: string) => {
        return this.s3Repository.download(key, downloadDir);
      });
      Logger.debug(`[GatheringService/gather] start download ${promiseList}`);
      await Promise.all(promiseList);
      Logger.debug("[GatheringService/gather] start compress");
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
