import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuditClientService } from "../audit/audit-client.service";
import { InternalAuthGuard } from "../internal/internal-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("internal")
@UseGuards(InternalAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditClient: AuditClientService,
  ) {}

  @Post("auth/login")
  async login(@Body() loginDto: LoginDto) {
    try {
      const response = await this.authService.login(loginDto);

      await this.auditClient.record({
        action: "LOGIN_SUCCEEDED",
        actorId: response.user.id,
        actorRole: response.user.role,
        resourceType: "AUTH_SESSION",
        resourceId: response.user.id,
        metadata: {
          email: response.user.email,
        },
      });

      return response;
    } catch (error) {
      await this.auditClient.record({
        action: "LOGIN_FAILED",
        resourceType: "AUTH_SESSION",
        metadata: {
          email: loginDto.email,
        },
      });
      throw error;
    }
  }

  @Get("users/:id")
  getUser(@Param("id") id: string) {
    return this.authService.getCurrentUser(id);
  }
}
