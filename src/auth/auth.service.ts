import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  Configuration,
  ConfigurationDocument,
} from "src/schema/configuration.schema";
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
      disallowApiKeyList: string[];
    } = await this.getConfiguration();
    if (configuration.allowApiKeyList.includes(apiKey)) {
      return true;
    }
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
          disallowApiKeyList: [],
        }).save();
      } else {
        return obj;
      }
    } catch (err) {
      Logger.debug(err);
    }
  }
}
