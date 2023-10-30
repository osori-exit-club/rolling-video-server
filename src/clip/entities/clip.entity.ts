export class Clip {
  readonly _id: string;
  readonly roomId: string;
  readonly nickname: string;
  readonly isPublic: boolean;
  readonly extension: string;
  readonly createAt: string;
  readonly updatedAt: string;
  readonly secretKey: string;
  constructor(
    _id: string,
    roomId: string,
    nickname: string,
    isPublic: boolean,
    extension: string,
    createAt: string,
    updatedAt: string,
    secretKey: string
  ) {
    this._id = _id;
    this.roomId = roomId;
    this.nickname = nickname;
    this.isPublic = isPublic;
    this.extension = extension;
    this.createAt = createAt;
    this.updatedAt = updatedAt;
    this.secretKey = secretKey;
  }
}
