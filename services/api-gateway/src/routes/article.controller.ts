import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ServiceProxyService } from '../proxy/service-proxy.service';

@Controller()
export class GatewayArticleController {
  constructor(private readonly proxyService: ServiceProxyService) {}

  @Post('articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  createArticle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    return this.proxyService.forward({
      serviceBaseUrl: 'ARTICLE_SERVICE_URL',
      path: '/internal/articles',
      method: 'POST',
      body,
      user,
    });
  }

  @Get('admin/articles/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findPending(@CurrentUser() user: AuthenticatedUser) {
    return this.proxyService.forward({
      serviceBaseUrl: 'ARTICLE_SERVICE_URL',
      path: '/internal/admin/articles/pending',
      user,
    });
  }

  @Post('admin/articles/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.forward({
      serviceBaseUrl: 'ARTICLE_SERVICE_URL',
      path: `/internal/admin/articles/${id}/approve`,
      method: 'POST',
      user,
    });
  }

  @Post('admin/articles/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.forward({
      serviceBaseUrl: 'ARTICLE_SERVICE_URL',
      path: `/internal/admin/articles/${id}/reject`,
      method: 'POST',
      user,
    });
  }
}
