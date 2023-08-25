export class Clip {
  _id: string;
  roomId: string;
  nickname: string;
  isPublic: boolean;
  videoUrl: string;
  createAt: string;
  updatedAt: string;
  constructor(
    _id: string,
    roomId: string,
    nickname: string,
    isPublic: boolean,
    videoUrl: string,
    createAt: string,
    updatedAt: string
  ) {
    this._id = _id;
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.videoUrl = videoUrl;
    this.createAt = createAt;
    this.updatedAt = updatedAt;
  }
}
