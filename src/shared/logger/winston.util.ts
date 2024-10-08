import { utilities, WinstonModule } from "nest-winston";
import * as winstonDaily from "winston-daily-rotate-file";
import * as winston from "winston";
import { LoggerService } from "@nestjs/common";

const env = process.env.NODE_ENV;
const logDir = __dirname + "/../../../logs"; // log 파일을 관리할 폴더

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: "YYYY-MM-DD",
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 7,
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.printf(
        (info) =>
          `[${info.timestamp}] ${process.env.NODE_ENV}.${info.level}: ${info.message}`
      )
    ),
  };
};

// rfc5424를 따르는 winston만의 log level
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
export const winstonLogger: LoggerService = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: env === "prd" ? "http" : "silly",
      format:
        env === "prd"
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp(),
              utilities.format.nestLike(process.env.NODE_ENV, {
                colors: true,
                prettyPrint: true,
              })
            ),
    }),

    new winstonDaily(dailyOptions("debug")),
    new winstonDaily(dailyOptions("info")),
    new winstonDaily(dailyOptions("warn")),
    new winstonDaily(dailyOptions("error")),
  ],
});
