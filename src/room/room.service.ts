import * as path from "path";
import { Injectable } from "@nestjs/common";
import { ClipDto } from "src/clip/dto/clip.dto";
import { GatheringService } from "src/gathering/gathering.service";
import { HashHelper } from "src/utils/hash/hash.helper";
import { CreateRoomDto } from "./dto/create-room.dto";
import { DeleteRoomResponseDto } from "./dto/delete-room-response.dto";
import { DeleteRoomDto } from "./dto/delete-room.dto";
import { RoomDto } from "./dto/room.dto";
import { RoomRepository } from "./room.repository";
import { OsHelper } from "src/utils/os/os.helper";
import { S3Repository } from "src/aws/s3/s3.repository";
import { ClipResponseDto } from "src/clip/dto/clip-response.dto";

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
      room.dueDate,
      room.clips.map((clip) => {
        return new ClipDto(
          clip._id.toString(),
          clip.roomId,
          clip.nickname,
          clip.isPublic,
          clip.extension
        );
      })
    );
  }

  async findAll(): Promise<RoomDto[]> {
    const result = await this.roomRepository.findAll();

    const signedUrlMap: Map<string, string> = new Map();
    const clipList: any[] = result.flatMap((room) => room.clips);
    for (let index = 0; index < clipList.length; index++) {
      const clip = clipList[index];

      const clipDto = new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.isPublic,
        clip.extension
      );
      const signedUrl = await this.s3Repository.getPresignedUrl(
        clipDto.getS3Key()
      );
      signedUrlMap[clipDto.clipId] = signedUrl;
    }

    return result.map((room) => {
      return new RoomDto(
        room._id.toString(),
        room.name,
        room.passwordHashed,
        room.recipient,
        room.dueDate,
        room.clips.map((clip) => {
          return new ClipResponseDto(
            new ClipDto(
              clip._id.toString(),
              clip.roomId,
              clip.nickname,
              clip.isPublic,
              clip.extension
            ),
            signedUrlMap[clip._id.toString()]
          );
        })
      );
    });
  }

  async findOne(id: string): Promise<RoomDto> {
    const room = await this.roomRepository.findOne(id);

    const signedUrlMap: Map<string, string> = new Map();
    const clipList: any[] = room.clips;
    for (let index = 0; index < clipList.length; index++) {
      const clip = clipList[index];

      const clipDto = new ClipDto(
        clip._id.toString(),
        clip.roomId,
        clip.nickname,
        clip.isPublic,
        clip.extension
      );
      const signedUrl = await this.s3Repository.getPresignedUrl(
        clipDto.getS3Key()
      );
      signedUrlMap[clipDto.clipId] = signedUrl;
    }

    return new RoomDto(
      id,
      room.name,
      room.passwordHashed,
      room.recipient,
      room.dueDate,
      room.clips.map((clip) => {
        return new ClipResponseDto(
          new ClipDto(
            clip._id.toString(),
            clip.roomId,
            clip.nickname,
            clip.isPublic,
            clip.extension
          ),
          signedUrlMap[clip._id.toString()]
        );
      })
    );
  }

  async remove(
    id: string,
    deleteRoomDto: DeleteRoomDto
  ): Promise<DeleteRoomResponseDto> {
    let room;
    try {
      room = await this.roomRepository.findOne(id);
    } catch (err) {
      return new DeleteRoomResponseDto(false, "존재하지 않는 id 입니다.");
    }
    if (room == null) {
      return new DeleteRoomResponseDto(false, "존재하지 않는 id 입니다.");
    }
    const isMatched = await this.hashHelper.isMatch(
      deleteRoomDto.password,
      room.passwordHashed
    );
    if (isMatched == false) {
      return new DeleteRoomResponseDto(false, "잘못된 패스워드 입니다");
    }
    const removedId = await this.roomRepository.remove(id);
    if (removedId != null) {
      return new DeleteRoomResponseDto(true, "삭제에 성공 했습니다.");
    }
    return new DeleteRoomResponseDto(false, "삭제에 실패 했습니다.");
  }

  async gather(roomId: string, outPath?: string) {
    const room = await this.findOne(roomId);
    const keyList = await Promise.all(
      room.clipList.map((it: ClipDto) => it.getS3Key())
    );

    let result: any = null;
    const key = path.join(RoomDto.getS3key(roomId), "gathered.zip");

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

        result = await this.gatheringService.gather(
          key,
          keyList,
          downloadDir,
          outFilePath
        );
      }
    );
    console.log(result);
    return result;
  }
}
