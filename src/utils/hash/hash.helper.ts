import { Injectable } from "@nestjs/common";

import * as bcrypt from "bcrypt";

@Injectable()
export class HashHelper {
  async createHash(
    password: string,
    // TODO: extract this value to user db for improving security
    saltOrRounds: number = 10
  ): Promise<string> {
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async isMatch(
    password: string | null | undefined,
    hash: string | null
  ): Promise<boolean> {
    if (!password && hash == null) {
      return true;
    }
    return await bcrypt.compare(password, hash);
  }
}
