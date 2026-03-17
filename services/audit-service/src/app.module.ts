import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { HealthController } from './health.controller';
import { InternalAuthGuard } from './internal/internal-auth.guard';
import { PrismaService } from './prisma/prisma.service';

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
  ],
  controllers: [AuditController, HealthController],
  providers: [AuditService, PrismaService, InternalAuthGuard],
})
export class AppModule {}
