import { Injectable, Logger } from "@nestjs/common";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

@Injectable()
export class FfmpegService {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }

  async makeWebmFile(fileUrl: string, outPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      ffmpeg(fileUrl)
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
        .on("progress", function (progress) {
          Logger.debug("Processing: " + progress.percent + "% done");
        })
        .on("error", function (err) {
          Logger.error("An error occurred: " + err.message);
          Logger.error(err);
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
          resolve(true);
        })
        .save(outPath);
    });
  }

  async getPlaytime(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, function (err, metadata) {
        if (err) {
          return reject(err);
        }

        const duration: number = metadata.format.duration;
        const hour: string = (duration / 3600).toFixed().padStart(2, "0");
        const minute: string = ((duration / 60) % 60)
          .toFixed()
          .padStart(2, "0");
        const seconds: string = (duration % 60).toFixed().padStart(2, "0");
        resolve(`${hour}:${minute}:${seconds}`);
      });
    });
  }
}
