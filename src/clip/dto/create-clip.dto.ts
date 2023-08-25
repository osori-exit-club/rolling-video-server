export class CreateClipDto {
  roomId: string;
  nickname: string;
  isPublic: boolean;
  video_url: string;
  constructor(
    roomId: string,
    nickname: string,
    isPublic: boolean,
    video_url: string
  ) {
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.video_url = video_url;
  }
}
