import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_NOTIFICATION_PROVIDER } from './notifications.constants';
import type { EmailNotificationProvider } from './notifications.types';
import { AuthClientService } from '../auth/auth-client.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly authClient: AuthClientService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_NOTIFICATION_PROVIDER)
    private readonly provider: EmailNotificationProvider,
  ) {}

  async sendArticleApprovedNotification(input: {
    articleId: string;
    title: string;
    sellerId: string;
  }) {
    const user = await this.authClient.findUserById(input.sellerId);
    const deliveryAddress =
      this.configService.get<string>('NOTIFICATIONS_TEST_RECIPIENT') ||
      user.email;

    await this.provider.send({
      to: deliveryAddress,
      subject: `Annonce approuvee: ${input.title}`,
      text: `Votre annonce "${input.title}" (${input.articleId}) a ete approuvee.`,
    });
  }

  async sendArticleRejectedNotification(input: {
    articleId: string;
    title: string;
    sellerId: string;
  }) {
    const user = await this.authClient.findUserById(input.sellerId);
    const deliveryAddress =
      this.configService.get<string>('NOTIFICATIONS_TEST_RECIPIENT') ||
      user.email;

    await this.provider.send({
      to: deliveryAddress,
      subject: `Annonce rejetee: ${input.title}`,
      text: `Votre annonce "${input.title}" (${input.articleId}) a ete rejetee.`,
    });
  }
}
