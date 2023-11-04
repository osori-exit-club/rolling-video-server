import { ApiProperty } from "@nestjs/swagger";

export class CreateClipRequest {
  @ApiProperty({
    description: "room's id",
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
  constructor(roomId: string, nickname: string, isPublic: boolean) {
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
  }
}
