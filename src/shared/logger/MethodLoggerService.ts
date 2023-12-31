import { LogLevel, LoggerService } from "@nestjs/common";
import { LoggerServiceWrapper } from "./wrapper/LoggerServiceWrapper";
import { ClassInfo } from "./interface/ClassInfo";

export class MethodLoggerService extends LoggerServiceWrapper {
  private readonly classInfo: ClassInfo;
  constructor(base: LoggerService, classInfo: ClassInfo) {
    super(base);
    this.classInfo = classInfo;
  }
  /**
   * Write a 'log' level log.
   */
  log(methodName: string, message: any): any {
    return this.base.log(message, {
      context: `[${this.classInfo.logTag}/${methodName}]`,
    });
  }
  /**
   * Write an 'error' level log.
   */
  error(
    methodName: string,
    error: Error,
    message: any = "An error occurred"
  ): any {
    return this.base.error(`${message} | failed by ${error.message}`, {
      context: `[${this.classInfo.logTag}/${methodName}]`,
      trace: error.stack,
    });
  }
  /**
   * Write a 'warn' level log.
   */
  warn(methodName: string, message: any): any {
    return this.base.warn(message, {
      context: `[${this.classInfo.logTag}/${methodName}]`,
    });
  }
  /**
   * Write a 'debug' level log.
   */
  debug?(methodName: string, message: any): any {
    return this.base.debug(message, {
      context: `[${this.classInfo.logTag}/${methodName}]`,
    });
  }
  /**
   * Write a 'verbose' level log.
   */
  verbose?(methodName: string, message: any): any {
    return this.base.verbose(message, {
      context: `[${this.classInfo.logTag}/${methodName}]`,
    });
  }
  /**
   * Set log levels.
   * @param levels log levels
   */
  setLogLevels?(levels: LogLevel[]): any {
    return this.base.setLogLevels(levels);
  }
}
