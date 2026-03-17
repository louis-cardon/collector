import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";

type ForwardOptions = {
  serviceBaseUrl: string;
  path: string;
  method?: string;
  body?: unknown;
  user?: AuthenticatedUser;
  query?: URLSearchParams;
};

@Injectable()
export class ServiceProxyService {
  constructor(private readonly configService: ConfigService) {}

  async forward<T>(options: ForwardOptions): Promise<T> {
    const baseUrl = this.configService.get<string>(options.serviceBaseUrl);

    if (!baseUrl) {
      throw new InternalServerErrorException(
        `Missing service URL for ${options.serviceBaseUrl}`,
      );
    }

    const normalizedBaseUrl = baseUrl.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl;
    const normalizedPath = options.path.startsWith("/")
      ? options.path
      : `/${options.path}`;
    const url = new URL(`${normalizedBaseUrl}${normalizedPath}`);

    if (options.query) {
      url.search = options.query.toString();
    }

    const headers = new Headers({
      Accept: "application/json",
      "x-internal-token":
        this.configService.get<string>("INTERNAL_SERVICE_TOKEN") ??
        "internal-change-me",
    });

    if (options.user) {
      headers.set("x-user-id", options.user.id);
      headers.set("x-user-email", options.user.email);
      headers.set("x-user-role", options.user.role);
    }

    const hasBody = options.body !== undefined;

    if (hasBody) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401) {
      throw new UnauthorizedException("Downstream service unauthorized");
    }

    const text = await response.text();
    const body = text.length > 0 ? (JSON.parse(text) as T) : ({} as T);

    if (!response.ok) {
      throw new HttpException(body as object, response.status);
    }

    return body;
  }
}
