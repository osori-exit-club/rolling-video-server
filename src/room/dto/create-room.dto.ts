export class CreateRoomDto {
  readonly name: string;
  readonly password: string | null;
  readonly recipient: string;
  constructor(name: string, password: string | null, recipient: string) {
    this.name = name;
    this.password = password;
    this.recipient = recipient;
  }
}
