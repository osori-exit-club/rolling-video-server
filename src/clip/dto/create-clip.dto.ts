export class CreateClipDto {
  roomId: string;
  nickname: string;
  isPublic: boolean;
  constructor(roomId: string, nickname: string, isPublic: boolean) {
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
  }
}
