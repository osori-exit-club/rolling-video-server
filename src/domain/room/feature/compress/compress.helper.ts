import { Injectable, Logger } from "@nestjs/common";
import * as AdmZip from "adm-zip";

@Injectable()
export class CompressHelper {
  constructor() {}

  compress(targetDir: string, outPath: string) {
    const zip = new AdmZip();
    try {
      zip.addLocalFolder(targetDir);
      // or write everything to disk
      Logger.debug(`[CompressHelper/compress] Start Zipping ... ${outPath}`);
      zip.writeZip(outPath);
      Logger.debug(`[CompressHelper/compress] Done Zip ${outPath}`);
    } catch (error) {
      console.error(`[CompressHelper/compress] ${error.stack}`);
      console.error(
        "[CompressHelper/compress] Zipping failed. Reason: %s",
        error
      );
      throw new Error(error.message);
    }
  }

  extract(targetDir: string, outPath: string) {
    const zip = new AdmZip(targetDir);
    zip.extractAllTo(outPath, true);
  }
}
