import * as fs from "fs";
import * as path from "path";
import { Injectable } from "@nestjs/common";
import { S3Repository } from "src/common/aws/s3/s3.repository";
import { CompressHelper } from "src/room/feature/compress/comporess.helper";

@Injectable()
export class GatheringService {
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
    await Promise.all(
      s3PathList.map((key: string) => {
        this.s3Repository.download(key, downloadDir);
      })
    );
    await this.compressHelper.compress(downloadDir, outFilePath);
    const fileContent = fs.readFileSync(outFilePath);

    return await this.s3Repository.uploadFile({
      buffer: fileContent,
      key: s3key,
    });
  }
}
