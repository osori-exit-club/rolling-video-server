import * as fs from "fs";
import * as path from "path";
import { Injectable } from "@nestjs/common";
import { S3Repository } from "src/shared/aws/s3/s3.repository";
import { CompressHelper } from "src/domain/room/feature/compress/comporess.helper";
import { Mutex } from "async-mutex";

@Injectable()
export class GatheringService {
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
    await Promise.all(
      s3PathList.map((key: string) => {
        this.s3Repository.download(key, downloadDir);
      })
    );
    await this.compressHelper.compress(downloadDir, outFilePath);
    release();
    const fileContent = fs.readFileSync(outFilePath);
    return await this.s3Repository.uploadFile({
      buffer: fileContent,
      key: s3key,
    });
  }
}
