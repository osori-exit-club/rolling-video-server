import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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
    const clip = await this.clipRepository.create(
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
        await this.s3Respository.uploadFile({
          key: clipDto.getS3Key(),
          buffer: file.buffer,
        });
        const playtime = await this.getPlaytime(clipDto);
        return { playtime };
      }
    );

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

    return new CreateClipResponse(clipDto);
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
    const signedUrl: string = await this.s3Respository.getPresignedUrl(
      clipDto.getS3Key()
    );
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
