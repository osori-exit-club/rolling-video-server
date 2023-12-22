import { Injectable, Logger } from "@nestjs/common";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

@Injectable()
export class FfmpegService {
  constructor() {
    Logger.debug(
      `[FfmpegService/constructor] ffmpegInstallPath ${ffmpegInstaller.path}`
    );
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }

  async makeWebmFile(inputPath: string, outPath: string): Promise<boolean> {
    Logger.debug(
      `[FfmpegService/makeWebmFile] inputPath = ${inputPath} | outPath = ${outPath}`
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
          Logger.debug("[FfmpegService/makeWebmFile] cmdline = " + cmdline)
        )
        .on("progress", function (progress) {
          Logger.debug(
            "[FfmpegService/makeWebmFile] Processing: " +
              progress.percent +
              "% done"
          );
        })
        .on("error", function (err) {
          Logger.error(
            "[FfmpegService/makeWebmFile] An error occurred: " + err.message
          );
          Logger.error(err);
          reject(err);
        })
        .on("end", (err, stdout, stderr) => {
          if (err) {
            Logger.error(stderr);
            return reject(err);
          }
          Logger.debug(stdout);
          Logger.debug("[FfmpegService/makeWebmFile] Processing finished.");
          var regex =
            /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/;
          var psnr = stdout.match(regex);
          Logger.debug(
            "[FfmpegService/makeWebmFile] This WebM transcode scored a PSNR of: "
          );
          Logger.debug(psnr[4] + "dB");
          resolve(true);
        })
        .save(outPath);
    });
  }
}
