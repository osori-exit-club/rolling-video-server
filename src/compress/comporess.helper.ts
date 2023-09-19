import { Injectable } from "@nestjs/common";
import * as AdmZip from "adm-zip";

@Injectable()
export class CompressHelper {
  constructor() {}

  compress(targetDir: string, outDir: string) {
    const zip = new AdmZip();
    zip.addLocalFolder(targetDir);
    // or write everything to disk
    console.log(`Start Ziping ... ${outDir}`);
    zip.writeZip(outDir);
    console.log(`Done Zip ${outDir}`);
  }
}
