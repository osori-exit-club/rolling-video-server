import { ApiProperty } from "@nestjs/swagger";

export class CreateClipResponse {
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
    example: "nickname",
  })
  readonly nickname: string;
  @ApiProperty({
    description: "메세지",
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
    description: "자동 생성된 비밀 번호",
    required: true,
    nullable: false,
    example: "$2b$10$7PGL5xUa/1RutkG7ZX2.euxACTiyGc1s6v/sx/JVk/wUcVwAAwUsO",
  })
  readonly password: string;
  @ApiProperty({
    description: "clip 영상 시간",
    required: true,
    nullable: false,
    example: "00:00:00",
  })
  readonly playtime: string;
  constructor({
    clipId,
    roomId,
    nickname,
    message,
    isPublic,
    extension,
    password,
    playtime,
  }: {
    clipId: string;
    roomId: string;
    nickname: string;
    message: string;
    isPublic: boolean | null;
    extension: string;
    password: string;
    playtime: string;
  }) {
    this.clipId = clipId;
    this.roomId = roomId;
    this.nickname = nickname;
    this.message = message;
    this.isPublic = isPublic || false;
    this.extension = extension;
    this.password = password;
    this.playtime = playtime;
  }
}
