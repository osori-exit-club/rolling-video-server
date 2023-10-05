import { ApiProperty } from "@nestjs/swagger";

export class DeleteRoomResponseDto {
  @ApiProperty({
    description: "삭제 성공 여부",
    example: "true",
  })
  readonly isSucceess: boolean;

  constructor(isSucceess: boolean) {
    this.isSucceess = isSucceess;
  }
}
