import { Injectable } from "@nestjs/common";
import { S3Repository } from "src/aws/s3/s3.repository";
import { RoomService } from "src/room/room.service";
import { ClipDto } from "src/clip/dto/clip.dto";
import { CompressHelper } from "src/compress/comporess.helper";

@Injectable()
export class GatheringService {
  constructor(
    private readonly s3Repository: S3Repository,
    private readonly roomService: RoomService,
    private readonly compressHelper: CompressHelper
  ) {}

  async gather(roomId: string, tempDir: string, outPath: string) {
    const room = await this.roomService.findOne(roomId);
    await Promise.all(
      room.clipList
        .map((it: ClipDto) => it.videoUrl)
        .map((videoUrl: string) => {
          this.s3Repository.download(videoUrl, tempDir);
        })
    );
    await this.compressHelper.compress(tempDir, outPath);
  }
}
