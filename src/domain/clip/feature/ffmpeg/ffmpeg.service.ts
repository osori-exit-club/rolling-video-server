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

  async convertVideo(
    inputPath: string,
    nickname: string,
    message: string,
    outPath: string
  ): Promise<boolean> {
    this.logger.debug(
      "convertVideo",
      `inputPath = ${inputPath} | outPath = ${outPath}`
    );
    const watermark_position_x: number = 24;
    const watermark_position_y: number = 24;
    const watermark_height: number = 24;
    const watermark_alpha: number = 0.3;
    const logoPath: string =
      __dirname + "/../../../../../resources/image/logo_rollingvideo.png";

    const nickname_fontsize: number = 12;
    const nickname_position_x: string = "24";
    const nickname_position_y: string = "h-text_h-34-33";

    const fontPath: string =
      __dirname + "/../../../../../resources/font/NotoSerifKR-Bold.otf";
    const message_fontsize: number = 12;
    const message_position_x: string = "24";
    const message_position_y: string = "h-text_h-33";

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .input(logoPath)
        .complexFilter([
          `[1]format=rgba,colorchannelmixer=aa=${watermark_alpha}[logo]`,
          `[logo][0]scale2ref=oh*mdar:${watermark_height}[logo][video]`,
          `[video][logo]overlay=${watermark_position_x}:${watermark_position_y}[video_logo]`,
          `[video_logo]drawtext=fontfile=${fontPath}:text='${nickname}':fontsize=${nickname_fontsize}:fontcolor=white:x=${nickname_position_x}:y=${nickname_position_y}[video_logo_nickname]`,
          `[video_logo_nickname]drawtext=fontfile=${fontPath}:text='${message}':fontsize=${message_fontsize}:fontcolor=white:x=${message_position_x}:y=${message_position_y}`,
        ])
        .on("start", (cmdline) =>
          this.logger.debug("convertVideo", `cmdline = ${cmdline}`)
        )
        .on("progress", function (progress) {
          this.logger.debug(
            "convertVideo",
            `Processing: ${progress.percent}% done`
          );
        })
        .on("error", function (err) {
          this.logger.error("convertVideo", err);
          reject(err);
        })
        .on("end", (err, stdout, stderr) => {
          if (err) {
            this.logger.error("convertVideo", stderr);
            return reject(err);
          }
          this.logger.debug("convertVideo", stdout);
          this.logger.debug("convertVideo", "Processing finished.");
          var regex =
            /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/;
          resolve(true);
        })
        .output(outPath)
        .run();
    });
  }
}
