import { Injectable, Logger } from "@nestjs/common";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

@Injectable()
export class FfmpegService {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }

  async makeWebmFile(fileUrl: string, outPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(fileUrl)
        .videoCodec("libvpx") //libvpx-vp9 could be used too
        .videoBitrate(1000, true) //Outputting a constrained 1Mbit VP8 video stream
        .outputOptions(
          "-minrate",
          "1000",
          "-maxrate",
          "1000",
          "-threads",
          "3", //Use number of real cores available on the computer - 1
          "-flags",
          "+global_header", //WebM won't love if you if you don't give it some headers
          "-psnr"
        ) //Show PSNR measurements in output. Anything above 40dB indicates excellent fidelity
        .on("progress", function (progress) {
          Logger.debug("Processing: " + progress.percent + "% done");
        })
        .on("error", function (err) {
          Logger.error("An error occurred: " + err.message);
          reject(err);
        })
        .on("end", (err, stdout, stderr) => {
          if (err) {
            Logger.error(stderr);
            return reject(err);
          }
          Logger.debug(stdout);
          Logger.debug("Processing finished.");
          var regex =
            /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/;
          var psnr = stdout.match(regex);
          Logger.debug("This WebM transcode scored a PSNR of: ");
          Logger.debug(psnr[4] + "dB");
          resolve();
        })
        .save(outPath);
    });
  }
}
