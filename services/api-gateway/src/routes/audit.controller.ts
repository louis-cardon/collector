import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ServiceProxyService } from "../proxy/service-proxy.service";

@Controller("admin/audit-logs")
export class GatewayAuditController {
  constructor(private readonly proxyService: ServiceProxyService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  findMany(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: Record<string, string>,
  ) {
    const search = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        search.set(key, value);
      }
    });

    return this.proxyService.forward({
      serviceBaseUrl: "AUDIT_SERVICE_URL",
      path: "/internal/audit-logs",
      query: search,
      user,
    });
  }
}
