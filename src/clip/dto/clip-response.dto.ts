import { ApiProperty } from "@nestjs/swagger";
import { ClipDto } from "./clip.dto";

export class ClipResponseDto extends ClipDto {
  @ApiProperty({
    description: "clip 영상 url",
    required: true,
    nullable: false,
    example: "",
  })
  readonly signedVideoUrl: string;
  constructor(clipDto: ClipDto, signedVideoUrl: string) {
    super(
      clipDto.clipId,
      clipDto.roomId,
      clipDto.nickname,
      clipDto.isPublic,
      clipDto.extension
    );
    this.signedVideoUrl = signedVideoUrl;
  }
}
