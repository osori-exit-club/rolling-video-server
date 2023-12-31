import { Injectable, Logger } from "@nestjs/common";
import * as AdmZip from "adm-zip";
import { LoggableService } from "src/shared/logger/LoggableService";
import { Loggable } from "src/shared/logger/interface/Loggable";

@Injectable()
export class CompressHelper implements Loggable {
  readonly logTag: string = this.constructor.name;
  private readonly logger: LoggableService = new LoggableService(Logger, this);

  constructor() {}

  compress(targetDir: string, outPath: string) {
    const zip = new AdmZip();
    try {
      zip.addLocalFolder(targetDir);
      // or write everything to disk
      this.logger.debug("compress", `Start Zipping ... ${outPath}`);
      zip.writeZip(outPath);
      this.logger.debug("compress", `Done Zip ${outPath}`);
    } catch (error) {
      this.logger.error("compress", error);
      this.logger.error("compress", error, "Zipping failed");
      throw new Error(error.message);
    }
  }

  extract(targetDir: string, outPath: string) {
    const zip = new AdmZip(targetDir);
    zip.extractAllTo(outPath, true);
  }
}
