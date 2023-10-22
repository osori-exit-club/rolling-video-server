import * as fs from "fs";
import * as path from "path";
import { Injectable } from "@nestjs/common";
import { S3Repository } from "src/aws/s3/s3.repository";
import { CompressHelper } from "src/compress/comporess.helper";

@Injectable()
export class GatheringService {
  constructor(
    private readonly s3Repository: S3Repository,
    private readonly compressHelper: CompressHelper
  ) {}

  async gather(
    fileUrlList: string[],
    downloadDir: string,
    outFilePath: string
  ) {
    await Promise.all(
      fileUrlList.map((videoUrl: string) => {
        this.s3Repository.download(videoUrl, downloadDir);
      })
    );
    await this.compressHelper.compress(downloadDir, outFilePath);
    const fileContent = fs.readFileSync(outFilePath);
    const fileName = outFilePath.split("/").pop();

    return await this.s3Repository.uploadFile({
      buffer: fileContent,
      key: path.join("gathered", fileName),
    });
  }
}
