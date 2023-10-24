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
    description: "비밀번호(헤싱)",
    example: "$2b$10$WlaT2hfjhw7TxFY1PENLzerG6Ek.laga4/vjdVs2r8VgasuZiU7xy",
  })
  readonly passwordHashed: string | null;
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
    example: ` {
      "clipId": "65099d65d2ba36bb284678e6",
      "roomId": "65099d54d2ba36bb284678e2",
      "nickname": "nickname3",
      "isPublic": true,
      "extension": "mp4"
    },
    {
      "clipId": "6509a7ab8173da335d01c6bc",
      "roomId": "65099d54d2ba36bb284678e2",
      "nickname": "nickname3",
      "isPublic": true,
      "extension": "mp4"
    }`,
  })
  readonly clipList: ClipDto[];
  constructor(
    id: string,
    name: string,
    passwordHashed: string,
    recipient: string,
    dueDate: Date,
    clipList: ClipDto[]
  ) {
    this.id = id;
    this.name = name;
    this.passwordHashed = passwordHashed;
    this.recipient = recipient;
    this.dueDate = dueDate;
    this.clipList = clipList;
  }

  static getS3key(roomId: string): string {
    return `rooms/${roomId}/`;
  }
}
