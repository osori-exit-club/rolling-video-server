export class RoomDto {
  readonly roomId: string;
  readonly name: string;
  readonly passwordHashed: string | null;
  readonly recipient: string;
  readonly dueDate: Date;
  readonly clipIds: string[];
  constructor(
    roomId: string,
    name: string,
    passwordHashed: string,
    recipient: string,
    dueDate: Date,
    clipIds: string[]
  ) {
    this.roomId = roomId;
    this.name = name;
    this.passwordHashed = passwordHashed;
    this.recipient = recipient;
    this.dueDate = dueDate;
    this.clipIds = clipIds;
  }

  static getS3key(roomId: string): string {
    return `rooms/${roomId}/`;
  }
}
