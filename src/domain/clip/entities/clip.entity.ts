export class Clip {
  readonly _id: string;
  readonly roomId: string;
  readonly nickname: string;
  readonly message: string;
  readonly isPublic: boolean;
  readonly extension: string;
  readonly createAt: string;
  readonly updatedAt: string;
  readonly password: string;
  constructor(
    _id: string,
    roomId: string,
    nickname: string,
    message: string,
    isPublic: boolean,
    extension: string,
    createAt: string,
    updatedAt: string,
    password: string
  ) {
    this._id = _id;
    this.roomId = roomId;
    this.nickname = nickname;
    this.message = message;
    this.isPublic = isPublic;
    this.extension = extension;
    this.createAt = createAt;
    this.updatedAt = updatedAt;
    this.password = password;
  }
}
