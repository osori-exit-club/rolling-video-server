import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Loggable } from "../logger/interface/Loggable";
import { LoggableService } from "../logger/LoggableService";

@Injectable()
export class ApiKeyGuard implements CanActivate, Loggable {
  readonly logTag: string = this.constructor.name;
  private readonly logger: LoggableService = new LoggableService(Logger, this);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers["x-api-key"] ?? req.query.api_key;
    this.logger.debug("canActivate", `X-API-KEY is ${key}`);

    return this.authService.isKeyValid(key);
  }
}
