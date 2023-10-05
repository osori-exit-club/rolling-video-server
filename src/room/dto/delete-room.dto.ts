import { ApiProperty } from "@nestjs/swagger";

export class DeleteRoomDto {
  @ApiProperty({
    description: "비밀번호",
    example: "OO의 생일파티",
  })
  readonly password: string;

  constructor(password: string) {
    this.password = password;
  }
}
