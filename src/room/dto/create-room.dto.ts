export class CreateRoomDto {
  readonly name: string;
  readonly password: string | null;
  readonly recipient: string;
  readonly dueDate: Date;
  constructor(
    name: string,
    password: string | null,
    recipient: string,
    dueDate: Date
  ) {
    this.name = name;
    this.password = password;
    this.recipient = recipient;
    this.dueDate = dueDate;
  }
}
