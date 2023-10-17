import { Injectable } from "@nestjs/common";
import * as AdmZip from "adm-zip";

@Injectable()
export class CompressHelper {
  constructor() {}

  compress(targetDir: string, outPath: string) {
    const zip = new AdmZip();
    try {
      zip.addLocalFolder(targetDir);
      // or write everything to disk
      console.log(`Start Ziping ... ${outPath}`);
      zip.writeZip(outPath);
      console.log(`Done Zip ${outPath}`);
    } catch (error) {
      console.error(error.stack);
      console.error("Zipping failed. Reason: %s", error);
      throw new Error(error.message);
    }
  }
}
