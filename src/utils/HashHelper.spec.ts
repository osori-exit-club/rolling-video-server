import { Test, TestingModule } from "@nestjs/testing";
import { createHash } from "crypto";
import { HashHelper } from "./HashHelper";

describe("HashHelper test", () => {
  let hashHelper: HashHelper;

  beforeEach(async () => {
    hashHelper = new HashHelper();
  });

  it("should be defined", () => {
    expect(hashHelper).toBeDefined();
  });

  it("createHash test", async () => {
    const password = "testpassword";
    const hashed = await hashHelper.createHash(password);
    expect(hashed).toBeDefined();
  });

  it("isMatch test", async () => {
    const password = "password";
    const hashed = await hashHelper.createHash(password);

    const result = await hashHelper.isMatch(password, hashed);
    expect(result).toBeTruthy();
  });

  it("isMatch test (wrong)", async () => {
    const password = "password";
    const hashed = await hashHelper.createHash(password);

    const wrongPassword = "testpasswordWong";
    const result = await hashHelper.isMatch(wrongPassword, hashed);
    expect(result).toBeFalsy();
  });
});
