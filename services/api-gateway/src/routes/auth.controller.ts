import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ServiceProxyService } from '../proxy/service-proxy.service';

@Controller('auth')
export class GatewayAuthController {
  constructor(private readonly proxyService: ServiceProxyService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: unknown) {
    return this.proxyService.forward({
      serviceBaseUrl: 'AUTH_SERVICE_URL',
      path: '/internal/auth/login',
      method: 'POST',
      body,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
