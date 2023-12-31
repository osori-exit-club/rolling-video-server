import { LogLevel, LoggerService } from "@nestjs/common";
import { LoggerServiceWrapper } from "./wrapper/LoggerServiceWrapper";
import { Loggable } from "./interface/Loggable";

export class LoggableService extends LoggerServiceWrapper {
  private readonly loggable: Loggable;
  constructor(base: LoggerService, loggable: Loggable) {
    super(base);
    this.loggable = loggable;
  }
  /**
   * Write a 'log' level log.
   */
  log(methodName: string, message: any): any {
    return this.base.log(message, {
      context: `[${this.loggable.logTag}/${methodName}]`,
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
      context: `[${this.loggable.logTag}/${methodName}]`,
      trace: error.stack,
    });
  }
  /**
   * Write a 'warn' level log.
   */
  warn(methodName: string, message: any): any {
    return this.base.warn(message, {
      context: `[${this.loggable.logTag}/${methodName}]`,
    });
  }
  /**
   * Write a 'debug' level log.
   */
  debug?(methodName: string, message: any): any {
    return this.base.debug(message, {
      context: `[${this.loggable.logTag}/${methodName}]`,
    });
  }
  /**
   * Write a 'verbose' level log.
   */
  verbose?(methodName: string, message: any): any {
    return this.base.verbose(message, {
      context: `[${this.loggable.logTag}/${methodName}]`,
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
