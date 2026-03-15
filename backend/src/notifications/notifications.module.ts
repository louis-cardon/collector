import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { EMAIL_NOTIFICATION_PROVIDER } from './notifications.constants';
import { NotificationsService } from './notifications.service';
import { LoggerEmailProvider } from './providers/logger-email.provider';
import { ResendEmailProvider } from './providers/resend-email.provider';
import { NotificationProviderName } from './notifications.types';

@Module({
  imports: [UsersModule],
  providers: [
    NotificationsService,
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
  exports: [NotificationsService],
})
export class NotificationsModule {}
