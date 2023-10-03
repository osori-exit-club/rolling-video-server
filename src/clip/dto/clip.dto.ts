import { ApiProperty } from "@nestjs/swagger";

export class ClipDto {
  @ApiProperty({
    description: "clip's id",
    required: true,
    nullable: false,
    example: "6509a7ab8173da335d01c6bc",
  })
  clipId: string;
  @ApiProperty({
    description: "clip이 속해 있는 Room의 id",
    required: true,
    nullable: false,
    example: "65099d54d2ba36bb284678e2",
  })
  roomId: string;
  @ApiProperty({
    description: "clip을 생성한 사람의 닉네임",
    required: true,
    nullable: false,
    example: "nickname3",
  })
  nickname: string;
  @ApiProperty({
    description: "clip 공개 여부",
    required: true,
    nullable: false,
    example: "true",
  })
  isPublic: boolean;
  @ApiProperty({
    description: "clip 영상 이미지 링크",
    required: true,
    nullable: false,
    example:
      "https://careerlego-salt-test.s3.amazonaws.com/videos/65099d54d2ba36bb284678e2/6509a7ab8173da335d01c6bc.mp4",
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
