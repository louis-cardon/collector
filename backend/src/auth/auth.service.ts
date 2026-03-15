import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuditAction, Role, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PinoLogger } from 'nestjs-pino';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const normalizedEmail = loginDto.email.trim().toLowerCase();
    let user: User;

    try {
      user = await this.validateCredentials(normalizedEmail, loginDto.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        await this.recordLoginFailed(normalizedEmail);
        this.logger.warn(
          {
            event: 'auth.login.failed',
            email: normalizedEmail,
          },
          'Login failed',
        );
      }

      throw error;
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    await this.recordLoginSucceeded(user.id, user.role, normalizedEmail);

    this.logger.info(
      {
        event: 'auth.login.succeeded',
        userId: user.id,
        role: user.role,
      },
      'Login succeeded',
    );

    return {
      accessToken,
      user: this.toAuthUserDto(user),
    };
  }

  private async recordLoginSucceeded(
    userId: string,
    role: Role,
    email: string,
  ): Promise<void> {
    try {
      await this.auditService.record({
        action: AuditAction.LOGIN_SUCCEEDED,
        actorId: userId,
        actorRole: role,
        resourceType: 'AUTH_SESSION',
        resourceId: userId,
        metadata: {
          email,
        },
      });
    } catch (error) {
      this.logger.error(
        {
          event: 'audit.login.succeeded.failed',
          userId,
          role,
          err: error instanceof Error ? error : undefined,
        },
        'Unable to persist login success audit log',
      );
    }
  }

  private async recordLoginFailed(email: string): Promise<void> {
    try {
      await this.auditService.record({
        action: AuditAction.LOGIN_FAILED,
        resourceType: 'AUTH_SESSION',
        metadata: {
          email,
          reason: 'INVALID_CREDENTIALS',
        },
      });
    } catch (error) {
      this.logger.error(
        {
          event: 'audit.login.failed.failed',
          err: error instanceof Error ? error : undefined,
        },
        'Unable to persist login failure audit log',
      );
    }
  }

  private async validateCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash =
      typeof user.passwordHash === 'string' ? user.passwordHash.trim() : '';

    if (!passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let isPasswordValid = false;

    try {
      isPasswordValid = await bcrypt.compare(password, passwordHash);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  toAuthUserDto(user: Pick<User, 'id' | 'email' | 'role'>): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
