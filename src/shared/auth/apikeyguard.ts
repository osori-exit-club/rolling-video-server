import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ClassInfo } from "../logger/interface/ClassInfo";
import { MethodLoggerService } from "../logger/MethodLoggerService";

@Injectable()
export class ApiKeyGuard implements CanActivate, ClassInfo {
  readonly logTag: string = this.constructor.name;
  private readonly logger: MethodLoggerService = new MethodLoggerService(
    Logger,
    this
  );

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers["x-api-key"] ?? req.query.api_key;
    this.logger.debug("canActivate", `X-API-KEY is ${key}`);

    return this.authService.isKeyValid(key);
  }
}
