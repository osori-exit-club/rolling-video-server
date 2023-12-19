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
  constructor(
    roomId: string,
    nickname: string,
    message: string,
    isPublic: boolean
  ) {
    this.roomId = roomId;
    this.nickname = nickname;
    this.message = message;
    this.isPublic = isPublic;
  }
}
