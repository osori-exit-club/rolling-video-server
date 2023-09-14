export class CreateRoomDto {
  id: string;
  name: string;
  password: string;
  recipient: string;
  dueDate: Date;
  clipList: Record<string, string>[];
}
