import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
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
    const clip = await this.clipRepository.create(createClipDto, extension);

    const clipDto = new ClipDto(
      clip._id.toString(),
      clip.roomId,
      clip.nickname,
      clip.message,
      clip.isPublic,
      clip.extension,
      clip.password
    );

    await this.s3Respository.uploadFile({
      key: clipDto.getS3Key(),
      buffer: file.buffer,
    });

    this.roomRepository.addClip(createClipDto.roomId, clip);

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
    const clipDto = new ClipDto(
      clip._id.toString(),
      clip.roomId,
      clip.nickname,
      clip.message,
      clip.isPublic,
      clip.extension,
      clip.password
    );
    // TODO 업로드 하는 시점에 저장해야 할거 같은데...
    const signedUrl: string = await this.s3Respository.getPresignedUrl(
      clipDto.getS3Key()
    );
    const duration: number = await getVideoDurationInSeconds(signedUrl);
    const hour: string = (duration / 3600).toFixed().padStart(2, "0");
    const minute: string = ((duration / 60) % 60).toFixed().padStart(2, "0");
    const seconds: string = (duration % 60).toFixed().padStart(2, "0");
    const playtime = `${hour}:${minute}:${seconds}`;
    return new ClipResponse(clipDto, signedUrl, playtime);
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
}
