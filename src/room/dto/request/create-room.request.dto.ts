import { ApiProperty } from "@nestjs/swagger";

export class CreateRoomRequest {
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
  readonly password: string | null;
  @ApiProperty({
    description: "받는 사람",
    example: "용의자X",
  })
  readonly recipient: string;
  constructor(name: string, password: string | null, recipient: string) {
    this.name = name;
    this.password = password;
    this.recipient = recipient;
  }
}
