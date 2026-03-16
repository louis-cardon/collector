import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsClientService {
  constructor(private readonly configService: ConfigService) {}

  async sendApproved(body: Record<string, unknown>): Promise<void> {
    await this.send('/internal/notifications/article-approved', body);
  }

  async sendRejected(body: Record<string, unknown>): Promise<void> {
    await this.send('/internal/notifications/article-rejected', body);
  }

  private async send(path: string, body: Record<string, unknown>): Promise<void> {
    const baseUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL');

    if (!baseUrl) {
      return;
    }

    await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-token':
          this.configService.get<string>('INTERNAL_SERVICE_TOKEN') ??
          'internal-change-me',
      },
      body: JSON.stringify(body),
    });
  }
}
