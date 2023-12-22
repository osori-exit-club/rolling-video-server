import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { HashHelper } from "./hash.helper";

describe("HashHelper test", () => {
  let hashHelper: HashHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [HashHelper],
    }).compile();

    hashHelper = module.get<HashHelper>(HashHelper);
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

  it("isMatch test (null)", async () => {
    const password = null;

    const result = await hashHelper.isMatch(password, null);
    expect(result).toBeTruthy();
  });

  it("isMatch test (undefined)", async () => {
    const password = undefined;

    const result = await hashHelper.isMatch(password, null);
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
