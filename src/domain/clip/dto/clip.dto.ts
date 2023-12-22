export class ClipDto {
  readonly clipId: string;
  readonly roomId: string;
  readonly nickname: string;
  readonly message: string;
  readonly isPublic: boolean;
  readonly extension: string;
  readonly password: string;
  readonly videoS3Key: string;
  readonly compactedVideoS3Key: string | null;
  constructor(
    clipId: string,
    roomId: string,
    nickname: string,
    message: string,
    isPublic: boolean,
    extension: string,
    password: string,
    videoS3Key: string,
    compactedVideoS3Key: string | null
  ) {
    this.clipId = clipId;
    this.roomId = roomId;
    this.nickname = nickname;
    this.message = message;
    this.isPublic = isPublic;
    this.extension = extension;
    this.password = password;
    this.videoS3Key = videoS3Key;
    this.compactedVideoS3Key = compactedVideoS3Key;
  }
}
