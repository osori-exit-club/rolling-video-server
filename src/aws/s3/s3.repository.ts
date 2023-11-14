import * as fs from "fs";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";

import {
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandInput,
  HeadObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
   * @param key s3내 파일의 경로
   * @returns string
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 10
  ): Promise<string | null> {
    const region = this.configService.get("AWS_REGION");
    const bucket = this.configService
      .get("AWS_S3_BUCKET_NAME")
      .replace("${NODE_ENV}", this.configService.getOrThrow("NODE_ENV"));

    const createPresignedUrlWithClient = async () => {
      const client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
          secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
        },
      });

      if (key[key.length - 1] == "/") {
        return null;
      }
      const it = new GetObjectCommand({ Bucket: bucket, Key: key });
      return getSignedUrl(client, it, { expiresIn: expiresIn });
    };

    try {
      const clientUrl = await createPresignedUrlWithClient();
      return clientUrl;
    } catch (error) {
      Logger.error(error);
      return null;
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
        Bucket: this.configService
          .get("AWS_S3_BUCKET_NAME")
          .replace("${NODE_ENV}", this.configService.getOrThrow("NODE_ENV")),
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
        Logger.debug(
          `Downloading bytes ${nextRange.start} to ${nextRange.end}`
        );

        const { ContentRange, Body } = await getObjectRange({
          bucket,
          key,
          ...nextRange,
        });

        writeStream.write(await Body.transformToByteArray());
        rangeAndLength = getRangeAndLength(ContentRange);
      }
      Logger.debug(`Downloading Done ${key}`);
    };
    if (key[key.length - 1] == "/") {
      return null;
    }
    return downloadInChunks({
      bucket: this.configService
        .get("AWS_S3_BUCKET_NAME")
        .replace("${NODE_ENV}", this.configService.getOrThrow("NODE_ENV")),
      key: key,
    });
  }

  async existsInS3(key: string): Promise<boolean> {
    const client = new S3Client({
      region: this.configService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });
    const bucket = this.configService
      .get("AWS_S3_BUCKET_NAME")
      .replace("${NODE_ENV}", this.configService.getOrThrow("NODE_ENV"));

    try {
      const bucketParams: HeadObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };
      const cmd = new HeadObjectCommand(bucketParams);
      const data: HeadObjectCommandOutput = await client.send(cmd);

      // I always get 200 for my testing if the object exists
      const exists = data.$metadata.httpStatusCode === 200;
      return exists;
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        // doesn't exist and permission policy includes s3:ListBucket
        return false;
      } else if (error.$metadata?.httpStatusCode === 403) {
        // doesn't exist, permission policy WITHOUT s3:ListBucket
        return false;
      } else {
        // some other error...log and rethrow if you like
      }
    }
  }
}
