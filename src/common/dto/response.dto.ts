import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<T> {
  @ApiProperty({
    description: "메세지",
    example: "메세지",
  })
  readonly message: string;

  @ApiProperty({
    description: "Response 객체",
    example: "data",
  })
  readonly data: T;

  constructor(message: string, data: T) {
    this.message = message;
    this.data = data;
  }
}
