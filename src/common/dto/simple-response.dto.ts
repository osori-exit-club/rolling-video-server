import { ApiProperty } from "@nestjs/swagger";

export class SimpleResponseDto {
  @ApiProperty({
    description: "메세지",
    example: "메세지",
  })
  readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}
