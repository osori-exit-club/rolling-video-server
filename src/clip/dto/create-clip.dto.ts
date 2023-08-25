export class CreateClipDto {
  roomId: string;
  nickname: string;
  isPublic: boolean;
  videoUrl: string;
  constructor(
    roomId: string,
    nickname: string,
    isPublic: boolean,
    videoUrl: string
  ) {
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.videoUrl = videoUrl;
  }
}
