import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { winstonLogger } from "./winston.util";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: LoggerService;
  constructor() {
    this.logger = winstonLogger;
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent: string = request.get("user-agent") || "";

    response.on("finish", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length") || "";
      let targetLogger = this.logger.log;
      if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn;
      } else if (statusCode >= 500) {
        this.logger.error;
      }
      targetLogger.call(
        this.logger,
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
      );
    });

    next();
  }
}
