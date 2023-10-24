import * as fs from "fs";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";
import dayjs from "dayjs";
import { v4 } from "uuid";
import { S3GetPresignedUrlResponseDto } from "./dto/get-presigned-url/s3-get-presigned-url-response.dto";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export enum FileExtensionType {
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  CSV = "csv",
}

@Injectable()
export class S3Repository {
  private readonly s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: configService.get("AWS_SECRET_ACCESS_KEY"),
      region: configService.get("AWS_REGION"),
    });
  }

  /**
   * s3의 presigned url을 생성
   * @param path 파일의 경로명을 랜덤으로 생성
   * @param contentType 파일의 컨텐츠 타입
   * @returns getPresignedUrlResponseDto
   */
  async getPresignedUrl(
    path: "meeting",
    contentType: FileExtensionType
  ): Promise<S3GetPresignedUrlResponseDto> {
    try {
      const params = {
        Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
        Expires: 600, // 1분
        Conditions: [["content-length-range", 0, 10000000]], // 100Byte - 10MB
        Fields: {
          "Content-Type": "image/jpeg,image/png",
          key: this.getRandomUrl(path, contentType),
        },
      };

      return new Promise(async (resolve, reject) => {
        this.s3.createPresignedPost(params, (err, data) => {
          if (err) {
            reject(err);
          }

          resolve(data as unknown as S3GetPresignedUrlResponseDto);
        });
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * 파일을 S3에 업로드
   * @param file 파일 정보
   * @returns 파일 S3 링크
   */
  async uploadFile({
    buffer,
    key,
  }: {
    buffer: Buffer;
    key: string;
  }): Promise<string> {
    try {
      const params = {
        Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
        Key: key,
        Body: buffer,
      };
      const data = await this.s3.upload(params).promise();

      return data.Location;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * S3로 부터 파일 다운로드
   *
   * @param key
   */
  async download(key: string, outDir: string) {
    const BUCKET = "careerlego-salt-test";

    const s3Client = new S3Client({
      region: this.configService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });
    const oneMB = 1024 * 1024;

    const getObjectRange = ({ bucket, key, start, end }) => {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        Range: `bytes=${start}-${end}`,
      });

      return s3Client.send(command);
    };

    const getRangeAndLength = (contentRange) => {
      const [range, length] = contentRange.split("/");
      const [start, end] = range.split("-");
      return {
        start: parseInt(start),
        end: parseInt(end),
        length: parseInt(length),
      };
    };

    const isComplete = ({ end, length }) => end === length - 1;

    // When downloading a large file, you might want to break it down into
    // smaller pieces. Amazon S3 accepts a Range header to specify the start
    // and end of the byte range to be downloaded.
    const downloadInChunks = async ({ bucket, key }) => {
      const splitted = key.split("/");
      const fileName = splitted[splitted.length - 1];

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const writeStream = fs
        .createWriteStream(`${outDir}/${fileName}`)
        .on("error", (err) => console.error(err));

      let rangeAndLength = { start: -1, end: -1, length: -1 };

      while (!isComplete(rangeAndLength)) {
        const { end } = rangeAndLength;
        const nextRange = { start: end + 1, end: end + oneMB };

        console.log(`Downloading bytes ${nextRange.start} to ${nextRange.end}`);

        const { ContentRange, Body } = await getObjectRange({
          bucket,
          key,
          ...nextRange,
        });

        writeStream.write(await Body.transformToByteArray());
        rangeAndLength = getRangeAndLength(ContentRange);
      }
      console.log(`Downloading Done ${key}`);
    };
    if (key[key.length - 1] == "/") {
      return null;
    }
    return downloadInChunks({
      bucket: BUCKET,
      key: key,
    });
  }

  /**
   * 파일의 경로명을 랜덤으로 생성
   * @param path 구분 폴더 명
   * @param contentType 파일의 컨텐츠 타입
   * @returns 파일의 경로명
   */
  private getRandomUrl(path: "meeting", contentType: FileExtensionType) {
    const uuid = v4();
    const date = dayjs().format("YYYY/MM/DD");

    return `${path}/${date}/${uuid}.${contentType}`;
  }
}
