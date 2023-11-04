import * as path from "path";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ClipDto } from "src/clip/dto/clip.dto";
import { GatheringService } from "src/gathering/gathering.service";
import { HashHelper } from "src/utils/hash/hash.helper";
import { CreateRoomDto } from "./dto/create-room.dto";
import { DeleteRoomDto } from "./dto/delete-room.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomRepository } from "./room.repository";
import { OsHelper } from "src/utils/os/os.helper";
import { S3Repository } from "src/aws/s3/s3.repository";
import { ClipResponseDto } from "src/clip/dto/clip-response.dto";
import { GatherRoomResponseDto } from "./dto/gather-room-response.dto";
import { ResponseMessage } from "src/utils/message.ko";
import { SimpleResponseDto } from "src/common/dto/simple-response.dto";

@Injectable()
export class RoomService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly s3Repository: S3Repository,
    private readonly hashHelper: HashHelper,
    private readonly gatheringService: GatheringService,
    private readonly osHelper: OsHelper
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<RoomDto> {
    const room = await this.roomRepository.create(createRoomDto);

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
          clip.isPublic,
          clip.extension,
          clip.password
        );
      })
    );
  }

  async remove(id: string, deleteRoomDto: DeleteRoomDto): Promise<any> {
    let room;
    try {
      room = await this.roomRepository.findOne(id);
    } catch (err) {
      throw new HttpException(
        ResponseMessage.ROOM_REMOVE_FAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    if (room == null) {
      throw new HttpException(
        ResponseMessage.ROOM_REMOVE_FAIL_NOT_FOUND,
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

  async gather(
    roomId: string,
    outPath?: string
  ): Promise<GatherRoomResponseDto> {
    const room: RoomDto | null = await this.findOne(roomId);
    if (room == null) {
      throw new HttpException(
        ResponseMessage.ROOM_GATHER_FAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    const keyList = await Promise.all(
      room.clipList.map((it: ClipDto) => it.getS3Key())
    );

    const key = path.join(RoomDto.getS3key(roomId), "gathered.zip");

    const existsInS3 = await this.s3Repository.existsInS3(key);
    if (!existsInS3) {
      console.log(`There is no gathered.zip (key: ${key}`);
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
    const expiresInDate: string =
      new Date().setDate(new Date().getDate() + expiresIn) + "";
    return new GatherRoomResponseDto(signedUrl, expiresInDate);
  }
}
