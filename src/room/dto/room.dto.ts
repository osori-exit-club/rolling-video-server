export class CreateRoomDto {
  id: string;
  name: string;
  password: string;
  recipient: string;
  clipList: Record<string, string>[];
}
