import * as bcrypt from "bcrypt";

export class HashHelper {
  async createHash(
    password: string,
    // TODO: extract this value to user db for improving security
    saltOrRounds: number = 10
  ): Promise<string> {
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async isMatch(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
