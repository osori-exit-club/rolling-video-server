import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers["x-api-key"] ?? req.query.api_key;
    Logger.debug("X-API-KEY is " + key);

    return this.authService.isKeyValid(key);
  }
}
