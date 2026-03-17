import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ServiceProxyService } from "../proxy/service-proxy.service";

@Controller()
export class GatewayCatalogController {
  constructor(private readonly proxyService: ServiceProxyService) {}

  @Get("catalog")
  findAll(@Query("categoryId") categoryId?: string) {
    const query = new URLSearchParams();

    if (categoryId) {
      query.set("categoryId", categoryId);
    }

    return this.proxyService.forward({
      serviceBaseUrl: "CATALOG_SERVICE_URL",
      path: "/public/catalog",
      query,
    });
  }

  @Get("catalog/:id")
  findOne(@Param("id") id: string) {
    return this.proxyService.forward({
      serviceBaseUrl: "CATALOG_SERVICE_URL",
      path: `/public/catalog/${id}`,
    });
  }

  @Get("categories")
  findCategories() {
    return this.proxyService.forward({
      serviceBaseUrl: "CATALOG_SERVICE_URL",
      path: "/public/categories",
    });
  }

  @Post("categories")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    return this.proxyService.forward({
      serviceBaseUrl: "CATALOG_SERVICE_URL",
      path: "/internal/categories",
      method: "POST",
      body,
      user,
    });
  }

  @Patch("categories/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  updateCategory(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    return this.proxyService.forward({
      serviceBaseUrl: "CATALOG_SERVICE_URL",
      path: `/internal/categories/${id}`,
      method: "PATCH",
      body,
      user,
    });
  }
}
