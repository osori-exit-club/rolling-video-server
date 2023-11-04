export class ClipDto {
  readonly clipId: string;
  readonly roomId: string;
  readonly nickname: string;
  readonly isPublic: boolean;
  readonly extension: string;
  readonly password: string;
  constructor(
    clipId: string,
    roomId: string,
    nickname: string,
    isPublic: boolean,
    extension: string,
    password: string
  ) {
    this.clipId = clipId;
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.extension = extension;
    this.password = password;
  }

  getS3Key(): string {
    return `rooms/${this.roomId}/clips/${this.clipId}.${this.extension}`;
  }
}
