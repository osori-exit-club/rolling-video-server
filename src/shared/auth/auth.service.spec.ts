import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  Configuration,
  ConfigurationSchema,
} from "src/model/mongodb/schema/configuration.schema";
import { AuthService } from "./auth.service";
import { Logger } from "@nestjs/common";

describe("RoomService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            uri: config.get("MONGODB_URL").replace("${NODE_ENV}", "test"),
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeatureAsync([
          {
            name: Configuration.name,
            useFactory: () => {
              return ConfigurationSchema;
            },
          },
        ]),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("설정 정보 조회", () => {
    it("정보 ", async () => {
      // Arrange

      // Act
      const result = await service.getConfiguration();

      // Assert
      expect(result).toHaveProperty("name");
      expect(result["name"]).toEqual("default");
      expect(result).toHaveProperty("allowApiKeyList");
      expect(result).toHaveProperty("blockedApiKeyList");
    });
  });
});
