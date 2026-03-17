import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuditClientService {
  constructor(private readonly configService: ConfigService) {}

  async record(body: Record<string, unknown>): Promise<void> {
    const baseUrl = this.configService.get<string>("AUDIT_SERVICE_URL");

    if (!baseUrl) {
      return;
    }

    await fetch(`${baseUrl}/internal/audit-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token":
          this.configService.get<string>("INTERNAL_SERVICE_TOKEN") ??
          "internal-change-me",
      },
      body: JSON.stringify(body),
    });
  }
}
