import { Injectable, Logger } from "@nestjs/common";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { ClassInfo } from "src/shared/logger/interface/ClassInfo";
import { MethodLoggerService } from "src/shared/logger/MethodLoggerService";

@Injectable()
export class FfmpegService implements ClassInfo {
  readonly logTag: string = this.constructor.name;
  private readonly logger: MethodLoggerService = new MethodLoggerService(
    Logger,
    this
  );

  constructor() {
    this.logger.debug(
      "constructor",
      `ffmpegInstallPath ${ffmpegInstaller.path}`
    );
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }

  async makeWebmFile(inputPath: string, outPath: string): Promise<boolean> {
    this.logger.debug(
      "makeWebmFile",
      `inputPath = ${inputPath} | outPath = ${outPath}`
    );
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec("libvpx") //libvpx-vp9 could be used too
        .videoBitrate(400) //Outputting a constrained 1Mbit(1000=1Mbit) VP8 video stream
        .outputOptions(
          "-minrate",
          "400",
          "-maxrate",
          "400",
          "-threads",
          "3", //Use number of real cores available on the computer - 1
          "-flags",
          "+global_header", //WebM won't love if you if you don't give it some headers
          "-psnr"
        ) //Show PSNR measurements in output. Anything above 40dB indicates excellent fidelity
        .on("start", (cmdline) =>
          this.logger.debug("makeWebmFile", `cmdline = ${cmdline}`)
        )
        .on("progress", function (progress) {
          this.logger.debug(
            "makeWebmFile",
            `Processing: ${progress.percent}% done`
          );
        })
        .on("error", function (err) {
          this.logger.error("makeWebmFile", err);
          reject(err);
        })
        .on("end", (err, stdout, stderr) => {
          if (err) {
            this.logger.error("makeWebmFile", stderr);
            return reject(err);
          }
          this.logger.debug("makeWebmFile", stdout);
          this.logger.debug("makeWebmFile", "Processing finished.");
          var regex =
            /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/;
          var psnr = stdout.match(regex);
          this.logger.debug(
            "makeWebmFile",
            "This WebM transcode scored a PSNR of: "
          );
          this.logger.debug("makeWebmFile", `${psnr[4]} dB`);
          resolve(true);
        })
        .save(outPath);
    });
  }
}
