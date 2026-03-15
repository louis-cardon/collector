import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Resend } from 'resend';
import {
  EmailNotificationProvider,
  NotificationEmail,
} from '../notifications.types';

@Injectable()
export class ResendEmailProvider implements EmailNotificationProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ResendEmailProvider.name);
  }

  async send(email: NotificationEmail): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();

    if (!apiKey) {
      this.logger.error(
        {
          event: 'notification.email.resend.misconfigured',
        },
        'Resend provider is not configured',
      );
      throw new ServiceUnavailableException('Email provider is not configured');
    }

    const from =
      this.configService.get<string>('NOTIFICATIONS_FROM_EMAIL')?.trim() ??
      'no-reply@collector.local';
    const client = new Resend(apiKey);
    const result = await client.emails.send({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
    });

    if (result.error) {
      this.logger.error(
        {
          event: 'notification.email.resend.failed',
          to: email.to,
          subject: email.subject,
          error: result.error.message,
        },
        'Resend email delivery failed',
      );
      throw new ServiceUnavailableException('Unable to send email');
    }

    this.logger.info(
      {
        event: 'notification.email.resend.sent',
        provider: 'resend',
        emailId: result.data?.id,
        from,
        to: email.to,
        subject: email.subject,
      },
      'Resend email sent',
    );
  }
}
