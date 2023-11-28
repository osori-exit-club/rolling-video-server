import { ApiProperty } from "@nestjs/swagger";
import { ClipDto } from "../clip.dto";

export class ClipResponse {
  @ApiProperty({
    description: "clip's id",
    required: true,
    nullable: false,
    example: "6509a7ab8173da335d01c6bc",
  })
  readonly clipId: string;
  @ApiProperty({
    description: "clip이 속해 있는 Room의 id",
    required: true,
    nullable: false,
    example: "65099d54d2ba36bb284678e2",
  })
  readonly roomId: string;
  @ApiProperty({
    description: "clip을 생성한 사람의 닉네임",
    required: true,
    nullable: false,
    example: "nickname3",
  })
  readonly nickname: string;
  @ApiProperty({
    description: "clip 메세지",
    required: true,
    nullable: false,
    example: "message",
  })
  readonly message: string;
  @ApiProperty({
    description: "clip 공개 여부",
    required: true,
    nullable: false,
    example: "true",
  })
  readonly isPublic: boolean;
  @ApiProperty({
    description: "clip 파일 확장자",
    required: true,
    nullable: false,
    example: "mp4",
  })
  readonly extension: string;
  @ApiProperty({
    description: "clip 영상 url",
    required: true,
    nullable: false,
    example: "",
  })
  readonly signedVideoUrl: string;
  @ApiProperty({
    description: "clip 영상 시간",
    required: true,
    nullable: false,
    example: "00:00:00",
  })
  readonly playtime: string;
  constructor(clipDto: ClipDto, signedVideoUrl: string) {
    this.clipId = clipDto.clipId;
    this.roomId = clipDto.roomId;
    this.nickname = clipDto.nickname;
    this.message = clipDto.message;
    this.isPublic = clipDto.isPublic;
    this.extension = clipDto.extension;
    this.signedVideoUrl = signedVideoUrl;
    this.playtime = clipDto.playtime;
  }
}
