import { ApiProperty } from "@nestjs/swagger";

export class UpdateRoomResponse {
  @ApiProperty({
    required: true,
    nullable: false,
    example: "653e44fad37be7b4c7482e44",
  })
  readonly roomId: string;
  @ApiProperty({
    description: "방의 이름",
    required: true,
    nullable: false,
    example: "OO의 생일파티",
  })
  readonly name: string;
  @ApiProperty({
    description: "비밀번호",
    example: "OO의 생일파티",
  })
  readonly recipient: string;
  constructor(roomId: string, name: string, recipient: string) {
    this.roomId = roomId;
    this.name = name;
    this.recipient = recipient;
  }
}
