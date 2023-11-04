import { ApiProperty } from "@nestjs/swagger";

export class GatherRoomResponse {
  @ApiProperty({
    description: "zip 다온로드 URL",
    example:
      "https://careerlego-salt-test.s3.us-east-1.amazonaws.com/rooms/6537cf63ba132621e8c041e0/gathered.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIATXK4KOG7SFU4D25N%2F20231029%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231029T101352Z&X-Amz-Expires=10&X-Amz-Signature=e8670965b166bba79d4425873d11f2a45c801767aacb63a5d0275e2c31d7a01e&X-Amz-SignedHeaders=host&x-id=GetObject",
  })
  readonly fileUrl: string;

  @ApiProperty({
    description: "만료 기한",
    example: "",
  })
  readonly expiresIn: string;

  constructor(fileUrl: string, expiresIn: string) {
    this.fileUrl = fileUrl;
    this.expiresIn = expiresIn;
  }
}
