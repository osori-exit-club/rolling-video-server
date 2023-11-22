import { ApiProperty } from "@nestjs/swagger";

export class CreateRoomRequest {
  @ApiProperty({
    description: "방의 이름",
    required: true,
    nullable: false,
    example: "TEST_ROOM_NAME",
  })
  readonly name: string;
  @ApiProperty({
    description: "비밀번호",
    example: "TEST_ROOM_PASSWORD",
  })
  readonly password: string | null;
  @ApiProperty({
    description: "받는 사람",
    example: "TEST_ROOM_RECIPIENT",
  })
  readonly recipient: string;
  constructor(name: string, password: string | null, recipient: string) {
    this.name = name;
    this.password = password;
    this.recipient = recipient;
  }
}
