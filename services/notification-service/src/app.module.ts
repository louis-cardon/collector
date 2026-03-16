import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthClientService } from './auth/auth-client.service';
import { HealthController } from './health.controller';
import { InternalAuthGuard } from './internal/internal-auth.guard';
import { EMAIL_NOTIFICATION_PROVIDER } from './notifications/notifications.constants';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationProviderName } from './notifications/notifications.types';
import { LoggerEmailProvider } from './notifications/providers/logger-email.provider';
import { ResendEmailProvider } from './notifications/providers/resend-email.provider';

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
  controllers: [NotificationsController, HealthController],
  providers: [
    NotificationsService,
    InternalAuthGuard,
    AuthClientService,
    LoggerEmailProvider,
    ResendEmailProvider,
    {
      provide: EMAIL_NOTIFICATION_PROVIDER,
      inject: [ConfigService, LoggerEmailProvider, ResendEmailProvider],
      useFactory: (
        configService: ConfigService,
        loggerProvider: LoggerEmailProvider,
        resendProvider: ResendEmailProvider,
      ) => {
        const providerName =
          configService.get<NotificationProviderName>(
            'NOTIFICATIONS_PROVIDER',
          ) ?? 'logger';

        return providerName === 'resend' ? resendProvider : loggerProvider;
      },
    },
  ],
})
export class AppModule {}
