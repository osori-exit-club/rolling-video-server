import { ApiProperty } from "@nestjs/swagger";

export class DeleteClipRequest {
  @ApiProperty({
    description: "비밀키",
    example: "$2b$10$7PGL5xUa/1RutkG7ZX2.euxACTiyGc1s6v/sx/JVk/wUcVwAAwUsO",
  })
  readonly password: string;

  constructor(password: string) {
    this.password = password;
  }
}
