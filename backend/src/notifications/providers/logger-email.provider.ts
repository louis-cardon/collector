import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import {
  EmailNotificationProvider,
  NotificationEmail,
} from '../notifications.types';

@Injectable()
export class LoggerEmailProvider implements EmailNotificationProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(LoggerEmailProvider.name);
  }

  send(email: NotificationEmail): Promise<void> {
    this.logger.info(
      {
        event: 'notification.email.logged',
        provider:
          this.configService.get<string>('NOTIFICATIONS_PROVIDER') ?? 'logger',
        from:
          this.configService.get<string>('NOTIFICATIONS_FROM_EMAIL') ??
          'no-reply@collector.local',
        to: email.to,
        subject: email.subject,
      },
      email.text,
    );

    return Promise.resolve();
  }
}
