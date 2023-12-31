import { LogLevel, LoggerService } from "@nestjs/common";

export class LoggerServiceWrapper implements LoggerService {
  protected readonly base: LoggerService;
  constructor(base: LoggerService) {
    this.base = base;
  }
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]): any {
    return this.base.log(message, optionalParams);
  }
  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]): any {
    return this.base.error(message, optionalParams);
  }
  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]): any {
    return this.base.warn(message, optionalParams);
  }
  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]): any {
    return this.base.debug(message, optionalParams);
  }
  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]): any {
    return this.base.verbose(message, optionalParams);
  }
  /**
   * Set log levels.
   * @param levels log levels
   */
  setLogLevels?(levels: LogLevel[]): any {
    return this.base.setLogLevels(levels);
  }
}
