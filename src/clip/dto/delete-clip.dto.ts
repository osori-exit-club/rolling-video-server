import { ApiProperty } from "@nestjs/swagger";

export class DeleteClipDto {
  @ApiProperty({
    description: "비밀키",
    example: "해시값",
  })
  readonly password: string;

  constructor(password: string) {
    this.password = password;
  }
}
