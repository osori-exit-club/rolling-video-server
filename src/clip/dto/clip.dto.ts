import { ApiProperty } from "@nestjs/swagger";

export class ClipDto {
  @ApiProperty({ description: "clip's id", required: true, nullable: false })
  clipId: string;
  @ApiProperty({
    description: "clip이 속해 있는 Room의 id",
    required: true,
    nullable: false,
  })
  roomId: string;
  @ApiProperty({
    description: "clip을 생성한 사람의 닉네임",
    required: true,
    nullable: false,
  })
  nickname: string;
  @ApiProperty({
    description: "clip 공개 여부",
    required: true,
    nullable: false,
  })
  isPublic: boolean;
  @ApiProperty({
    description: "clip 영상 이미지 링크",
    required: true,
    nullable: false,
  })
  videoUrl: string;
  constructor(
    clipId: string,
    roomId: string,
    nickname: string,
    isPublic: boolean,
    videoUrl: string
  ) {
    this.clipId = clipId;
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.videoUrl = videoUrl;
  }
}
