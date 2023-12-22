import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  Configuration,
  ConfigurationDocument,
} from "src/shared/mongodb/schema/configuration.schema";
import { Model } from "mongoose";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Configuration.name)
    private readonly configurationModel: Model<ConfigurationDocument>
  ) {}

  async isKeyValid(apiKey: string): Promise<boolean> {
    const configuration: {
      allowApiKeyList: string[];
      blockedApiKeyList: string[];
    } = await this.getConfiguration();
    if (configuration.blockedApiKeyList.includes(apiKey)) {
      return false;
    }
    if (configuration.allowApiKeyList.includes(apiKey)) {
      return true;
    }
    return configuration.allowApiKeyList.includes("*");
  }

  async getConfiguration(): Promise<any> {
    try {
      const obj = await this.configurationModel.findOne({
        name: "default",
      });
      if (obj == null) {
        return new this.configurationModel({
          name: "default",
          allowApiKeyList: [],
          blockedApiKeyList: [],
        }).save();
      } else {
        return obj;
      }
    } catch (err) {
      Logger.debug(err);
    }
  }
}
