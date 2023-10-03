import { ApiProperty } from "@nestjs/swagger";

export class CreateRoomDto {
  @ApiProperty({
    description: "방의 이름",
    required: true,
    nullable: false,
    example: "OO의 생일파티",
  })
  id: string;
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
  @ApiProperty({
    description: "마감 일자",
    example: "2023-09-17T14:41:11.487Z",
  })
  dueDate: Date;
  @ApiProperty({
    description: "Clip 리스트",
    example: "[]",
  })
  clipList: Record<string, string>[];
}
