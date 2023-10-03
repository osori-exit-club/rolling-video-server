import { ApiProperty } from "@nestjs/swagger";
import { Date } from "mongoose";
import { ClipDto } from "src/clip/dto/clip.dto";

export class RoomDto {
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
  clipList: ClipDto[];
  constructor(
    id: string,
    name: string,
    password: string,
    recipient: string,
    dueDate: Date,
    clipList: ClipDto[]
  ) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.recipient = recipient;
    this.dueDate = dueDate;
    this.clipList = clipList;
  }
}
