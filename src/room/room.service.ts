import * as path from "path";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ClipDto } from "src/clip/dto/clip.dto";
import { GatheringService } from "src/gathering/gathering.service";
import { HashHelper } from "src/utils/hash/hash.helper";
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
import { DeleteRoomRequest } from "./dto/request/delete-room.request.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomRepository } from "./room.repository";
import { OsHelper } from "src/utils/os/os.helper";
import { S3Repository } from "src/aws/s3/s3.repository";
import { GatherRoomResponse } from "./dto/response/gather-room.response.dto";
import { ResponseMessage } from "src/utils/message.ko";
import { Constants } from "src/utils/constants";
import { UpdateRoomRequest } from "./dto/request/update-room.request.dto";
import { ClipRepository } from "src/clip/clip.repository";

@Injectable()
export class RoomService {
  constructor(
    private readonly clipRepository: ClipRepository,
    private readonly roomRepository: RoomRepository,
    private readonly s3Repository: S3Repository,
    private readonly hashHelper: HashHelper,
    private readonly gatheringService: GatheringService,
    private readonly osHelper: OsHelper
  ) {}

  async create(createRoomDto: CreateRoomRequest): Promise<RoomDto> {
    const dueDate: Date = new Date();
    dueDate.setDate(new Date().getDate() + Constants.ROOM_DEFAULT_EXPIRED_DAY);
    dueDate.setUTCHours(0);
    dueDate.setUTCMinutes(0);
    dueDate.setUTCSeconds(0);
    dueDate.setUTCMilliseconds(0);

    const room = await this.roomRepository.create(
      Object.assign({ dueDate }, createRoomDto)
    );

    return room;
  }

  async findAll(): Promise<RoomDto[]> {
    return await this.roomRepository.findAll();
  }

  async findOne(id: string): Promise<RoomDto | null> {
    return await this.roomRepository.findOne(id);
  }

  async remove(id: string, deleteRoomDto: DeleteRoomRequest): Promise<any> {
    const roomDto = await this.roomRepository.findOne(id);
    const isMatched = await this.hashHelper.isMatch(
      deleteRoomDto.password,
      roomDto.passwordHashed
    );
    if (isMatched == false) {
      throw new HttpException(
        ResponseMessage.ROOM_REMOVE_FAIL_WONG_PASSWORD,
        HttpStatus.BAD_REQUEST
      );
    }
    return await this.roomRepository.remove(id);
  }

  async update(
    roomId: string,
    updateRoomDto: UpdateRoomRequest
  ): Promise<RoomDto> {
    let room;
    try {
      room = await this.roomRepository.findOne(roomId);
    } catch (err) {
      throw new HttpException(
        ResponseMessage.ROOM_UPDATE_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    if (room == null) {
      throw new HttpException(
        ResponseMessage.ROOM_UPDATE_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    const isMatched = await this.hashHelper.isMatch(
      updateRoomDto.password,
      room.passwordHashed
    );
    if (isMatched == false) {
      throw new HttpException(
        ResponseMessage.ROOM_UPDATE_FAIL_WONG_PASSWORD,
        HttpStatus.BAD_REQUEST
      );
    }
    const roomDto: RoomDto = await this.roomRepository.update(
      roomId,
      updateRoomDto
    );
    return roomDto;
  }

  async gather(roomId: string, outPath?: string): Promise<GatherRoomResponse> {
    const room: RoomDto | null = await this.findOne(roomId);

    if (room == null) {
      throw new HttpException(
        ResponseMessage.ROOM_GATHER_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    if (room.clipIds.length == 0) {
      throw new HttpException(
        ResponseMessage.ROOM_GATHER_FAIL_EMPTY_CLIP,
        HttpStatus.BAD_REQUEST
      );
    }
    const keyList = await Promise.all(
      room.clipIds.map((clipId) => {
        return this.clipRepository.findOne(clipId);
      })
    )
      .then((result) => result.map((it: ClipDto) => it.getS3Key()))
      .catch((err) => {
        throw err;
      });

    const key = path.join(RoomDto.getS3key(roomId), "gathered.zip");

    const existsInS3 = await this.s3Repository.existsInS3(key);

    if (!existsInS3) {
      Logger.debug(`There is no gathered.zip (key: ${key}`);
      await this.osHelper.openTempDirectory(
        `${roomId}/clips`,
        async (downloadDir: string) => {
          const outFilePath =
            outPath != null
              ? outPath
              : path.join(
                  await this.osHelper.createTempDirectory("gathered"),
                  `${roomId}.zip`
                );

          await this.gatheringService.gather(
            key,
            keyList,
            downloadDir,
            outFilePath
          );
        }
      );
    }
    const expiresIn: number = 10;
    const signedUrl: string = await this.s3Repository.getPresignedUrl(
      key,
      expiresIn
    );
    const expiresInDate: Date = new Date();
    expiresInDate.setDate(new Date().getDate() + expiresIn);

    return new GatherRoomResponse(signedUrl, expiresInDate.toISOString());
  }
}
