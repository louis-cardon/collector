import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { EMAIL_NOTIFICATION_PROVIDER } from './notifications.constants';
import { NotificationsService } from './notifications.service';
import { LoggerEmailProvider } from './providers/logger-email.provider';

@Module({
  imports: [UsersModule],
  providers: [
    NotificationsService,
    LoggerEmailProvider,
    {
      provide: EMAIL_NOTIFICATION_PROVIDER,
      useExisting: LoggerEmailProvider,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
