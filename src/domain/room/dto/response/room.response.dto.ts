import { ApiProperty } from "@nestjs/swagger";

export class RoomResponse {
  @ApiProperty({
    required: true,
    nullable: false,
    example: "653e44fad37be7b4c7482e44",
  })
  readonly roomId: string;
  @ApiProperty({
    description: "방의 이름",
    required: true,
    nullable: false,
    example: "OO의 생일파티",
  })
  readonly name: string;
  @ApiProperty({
    description: "받는 사람",
    example: "용의자X",
  })
  readonly recipient: string;
  @ApiProperty({
    description: "마감 일자",
    example: "2023-09-17T14:41:11.487Z",
  })
  readonly dueDate: Date;
  @ApiProperty({
    description: "Clip 리스트",
    example: ["65099d65d2ba36bb284678e6", "6509a7ab8173da335d01c6bc"],
  })
  readonly clipIdList: string[];
  constructor(
    roomId: string,
    name: string,
    recipient: string,
    dueDate: Date,
    clipIdList: string[]
  ) {
    this.roomId = roomId;
    this.name = name;
    this.recipient = recipient;
    this.dueDate = dueDate;
    this.clipIdList = clipIdList;
  }
}
