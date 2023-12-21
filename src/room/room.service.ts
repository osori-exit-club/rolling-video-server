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

@Injectable()
export class RoomService {
  constructor(
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

    return new RoomDto(
      room._id.toString(),
      room.name,
      room.passwordHashed,
      room.recipient,
      new Date(+room.dueDate),
      room.clips.map((clip) => {
        return new ClipDto(
          clip._id.toString(),
          clip.roomId,
          clip.nickname,
          clip.message,
          clip.isPublic,
          clip.extension,
          clip.password
        );
      })
    );
  }

  async findAll(): Promise<RoomDto[]> {
    const result = await this.roomRepository.findAll();

    return result.map((room) => {
      return new RoomDto(
        room._id.toString(),
        room.name,
        room.passwordHashed,
        room.recipient,
        new Date(+room.dueDate),
        room.clips.map((clip) => {
          return new ClipDto(
            clip._id.toString(),
            clip.roomId,
            clip.nickname,
            clip.message,
            clip.isPublic,
            clip.extension,
            clip.password
          );
        })
      );
    });
  }

  async findOne(id: string): Promise<RoomDto | null> {
    let room: any;
    try {
      room = await this.roomRepository.findOne(id);
      if (room == null) {
        return null;
      }
    } catch (e) {
      return null;
    }

    return new RoomDto(
      id,
      room.name,
      room.passwordHashed,
      room.recipient,
      room.dueDate,
      room.clips.map((clip) => {
        return new ClipDto(
          clip._id.toString(),
          clip.roomId,
          clip.nickname,
          clip.message,
          clip.isPublic,
          clip.extension,
          clip.password
        );
      })
    );
  }

  async remove(id: string, deleteRoomDto: DeleteRoomRequest): Promise<any> {
    let room;
    try {
      room = await this.roomRepository.findOne(id);
    } catch (err) {
      throw new HttpException(
        ResponseMessage.ROOM_REMOVE_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    if (room == null) {
      throw new HttpException(
        ResponseMessage.ROOM_REMOVE_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    const isMatched = await this.hashHelper.isMatch(
      deleteRoomDto.password,
      room.passwordHashed
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
    const keyList = await Promise.all(
      room.clipList.map((it: ClipDto) => it.getS3Key())
    );

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
