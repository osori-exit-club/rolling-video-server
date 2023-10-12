import { ApiProperty } from "@nestjs/swagger";

export class DeleteRoomResponseDto {
  @ApiProperty({
    description: "삭제 성공 여부",
    example: "true",
  })
  readonly isSucceess: boolean;

  @ApiProperty({
    description: "메세지",
    example: "true",
  })
  readonly message: string;

  constructor(isSucceess: boolean, message: string) {
    this.isSucceess = isSucceess;
    this.message = message;
  }
}
