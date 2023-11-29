import { ApiProperty } from "@nestjs/swagger";

export class CreateClipRequest {
  @ApiProperty({
    description: "room's id",
    required: true,
    nullable: false,
  })
  readonly roomId: string;
  @ApiProperty({
    description: "clip을 생성한 사람의 닉네임",
    required: true,
    nullable: false,
  })
  readonly nickname: string;
  @ApiProperty({
    description: "clip 메세지",
    required: true,
    nullable: false,
  })
  readonly message: string;
  @ApiProperty({
    description: "clip 공개 여부",
    required: true,
    nullable: false,
  })
  readonly isPublic: boolean;
  @ApiProperty({
    description: "영상 재생 시간",
    required: false,
    nullable: true,
    example: "00:00:15",
  })
  playtime: string | null;
  constructor(
    roomId: string,
    nickname: string,
    message: string,
    isPublic: boolean,
    playtime: string | null = null
  ) {
    this.roomId = roomId;
    this.nickname = nickname;
    this.message = message;
    this.isPublic = isPublic;
    this.playtime = playtime;
  }
}
