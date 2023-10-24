export class Clip {
  readonly _id: string;
  readonly roomId: string;
  readonly nickname: string;
  readonly isPublic: boolean;
  readonly extensions: string;
  readonly createAt: string;
  readonly updatedAt: string;
  constructor(
    _id: string,
    roomId: string,
    nickname: string,
    isPublic: boolean,
    extensions: string,
    createAt: string,
    updatedAt: string
  ) {
    this._id = _id;
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.extensions = extensions;
    this.createAt = createAt;
    this.updatedAt = updatedAt;
  }
}
