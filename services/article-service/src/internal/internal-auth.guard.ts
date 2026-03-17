import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const token = request.headers["x-internal-token"];
    const expected =
      this.configService.get<string>("INTERNAL_SERVICE_TOKEN") ??
      "internal-change-me";

    if (token !== expected) {
      throw new UnauthorizedException("Invalid internal token");
    }

    return true;
  }
}
