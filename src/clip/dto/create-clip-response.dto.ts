import { ApiProperty } from "@nestjs/swagger";

export class CreateClipResponseDto {
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
    description: "clip 해시키",
    required: true,
    nullable: false,
    example: "hashed",
  })
  readonly password: string;
  constructor({
    clipId,
    roomId,
    nickname,
    isPublic,
    extension,
    password,
  }: {
    clipId: string;
    roomId: string;
    nickname: string;
    isPublic: boolean;
    extension: string;
    password: string;
  }) {
    this.clipId = clipId;
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.extension = extension;
    this.password = password;
  }
}
