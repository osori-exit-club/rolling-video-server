import { ClipDto } from "src/clip/dto/clip.dto";

export class RoomDto {
  readonly roomId: string;
  readonly name: string;
  readonly passwordHashed: string | null;
  readonly recipient: string;
  readonly dueDate: Date;
  readonly clipList: ClipDto[];
  constructor(
    roomId: string,
    name: string,
    passwordHashed: string,
    recipient: string,
    dueDate: Date,
    clipList: ClipDto[]
  ) {
    this.roomId = roomId;
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
