import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import * as ffmpeg from "fluent-ffmpeg";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { S3Repository } from "src/aws/s3/s3.repository";
import { RoomRepository } from "src/room/room.repository";
import { getVideoDurationInSeconds } from "get-video-duration";
import { ClipRepository } from "./clip.repository";
import { ClipDto } from "./dto/clip.dto";
import { ClipResponse } from "./dto/response/clip.response.dto";
import { CreateClipRequest } from "./dto/request/create-clip.request.dto";
import { ResponseMessage } from "src/utils/message.ko";
import { CreateClipResponse } from "./dto/response/create-clip.response.dto";
import { DeleteClipRequest } from "./dto/request/delete-clip.request.dto";

@Injectable()
export class ClipService {
  constructor(
    private readonly clipRepository: ClipRepository,
    private readonly roomRepository: RoomRepository,
    private readonly s3Respository: S3Repository
  ) {}

  async create(
    createClipDto: CreateClipRequest,
    file: any
  ): Promise<CreateClipResponse> {
    const splitted = file.originalname.split(".");
    const extension = splitted[splitted.length - 1];
    const createClip = await this.clipRepository.create(
      createClipDto,
      extension,
      async (clip: any) => {
        const clipDto = new ClipDto(
          clip._id.toString(),
          clip.roomId,
          clip.nickname,
          clip.message,
          clip.isPublic,
          clip.extension,
          clip.password,
          null
        );
        const key: string = clipDto.getS3Key();
        await this.s3Respository.uploadFile({
          key,
          buffer: file.buffer,
        });
        const playtime: string = await this.getPlaytime(clipDto);
        return { playtime };
      }
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
    this.roomRepository.addClip(createClipDto.roomId, createClip);

    const signedUrl = await this.s3Respository.getPresignedUrl(
      clipDto.getS3Key()
    );
    return new Promise((resolve, reject) => {
      ffmpeg(signedUrl)
        .videoCodec("libvpx") //libvpx-vp9 could be used too
        .videoBitrate(1000, true) //Outputting a constrained 1Mbit VP8 video stream
        .outputOptions(
          "-minrate",
          "1000",
          "-maxrate",
          "1000",
          "-threads",
          "3", //Use number of real cores available on the computer - 1
          "-flags",
          "+global_header", //WebM won't love if you if you don't give it some headers
          "-psnr"
        ) //Show PSNR measurements in output. Anything above 40dB indicates excellent fidelity
        .on("progress", function (progress) {
          Logger.debug("Processing: " + progress.percent + "% done");
        })
        .on("error", function (err) {
          Logger.error("An error occurred: " + err.message);
          reject(err);
        })
        .on("end", (err, stdout, stderr) => {
          if (err) {
            Logger.error(stderr);
            return reject(err);
          }
          Logger.debug(stdout);
          Logger.debug("Processing finished.");
          var regex =
            /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/;
          var psnr = stdout.match(regex);
          Logger.debug("This WebM transcode scored a PSNR of: ");
          Logger.debug(psnr[4] + "dB");

          const fileContent = fs.readFileSync("futbol.webm");
          this.s3Respository.uploadFile({
            key: clipDto.getS3ThumbKey(),
            buffer: fileContent,
          });

          resolve(new CreateClipResponse(clipDto));
        })
        .save("futbol.webm");
    });
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
        clip.password
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
    if (clip.playtime == null) {
      const clipDto = new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.message,
        clip.isPublic,
        clip.extension,
        clip.password
      );
      const playtime = await this.getPlaytime(clipDto);
      clip.playtime = playtime;
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

  async remove(id: string, deleteClipDto: DeleteClipRequest) {
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

  private async getPlaytime(clipDto: ClipDto): Promise<string> {
    const signedUrl: string = await this.s3Respository.getPresignedUrl(
      clipDto.getS3Key()
    );
    const duration: number = await getVideoDurationInSeconds(signedUrl);
    const hour: string = (duration / 3600).toFixed().padStart(2, "0");
    const minute: string = ((duration / 60) % 60).toFixed().padStart(2, "0");
    const seconds: string = (duration % 60).toFixed().padStart(2, "0");
    return `${hour}:${minute}:${seconds}`;
  }
}
