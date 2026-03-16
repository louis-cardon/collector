import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { AuditClientService } from './audit/audit-client.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { HealthController } from './health.controller';
import { InternalAuthGuard } from './internal/internal-auth.guard';
import { PrismaService } from './prisma/prisma.service';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'change-me',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController, HealthController],
  providers: [
    AuthService,
    UsersService,
    PrismaService,
    InternalAuthGuard,
    AuditClientService,
  ],
})
export class AppModule {}
