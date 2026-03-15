import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Article, ArticleStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { UsersService } from '../users/users.service';
import { EMAIL_NOTIFICATION_PROVIDER } from './notifications.constants';
import type { EmailNotificationProvider } from './notifications.types';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    @Inject(EMAIL_NOTIFICATION_PROVIDER)
    private readonly provider: EmailNotificationProvider,
  ) {
    this.logger.setContext(NotificationsService.name);
  }

  async sendArticleApprovedNotification(
    article: Pick<Article, 'id' | 'title' | 'sellerId'>,
  ): Promise<void> {
    const recipient = await this.resolveRecipient(article.sellerId);
    const deliveryAddress = this.resolveDeliveryAddress(recipient.email);

    await this.provider.send({
      to: deliveryAddress,
      subject: `Annonce approuvee: ${article.title}`,
      text: `Votre annonce "${article.title}" (${article.id}) a ete approuvee.`,
    });

    this.logger.info(
      {
        event: 'notification.article.approved',
        articleId: article.id,
        deliveryAddress,
        recipientEmail: recipient.email,
        sellerId: article.sellerId,
        status: ArticleStatus.APPROVED,
      },
      'Article approval notification sent',
    );
  }

  async sendArticleRejectedNotification(
    article: Pick<Article, 'id' | 'title' | 'sellerId'>,
  ): Promise<void> {
    const recipient = await this.resolveRecipient(article.sellerId);
    const deliveryAddress = this.resolveDeliveryAddress(recipient.email);

    await this.provider.send({
      to: deliveryAddress,
      subject: `Annonce rejetee: ${article.title}`,
      text: `Votre annonce "${article.title}" (${article.id}) a ete rejetee.`,
    });

    this.logger.info(
      {
        event: 'notification.article.rejected',
        articleId: article.id,
        deliveryAddress,
        recipientEmail: recipient.email,
        sellerId: article.sellerId,
        status: ArticleStatus.REJECTED,
      },
      'Article rejection notification sent',
    );
  }

  private async resolveRecipient(sellerId: string) {
    const seller = await this.usersService.findById(sellerId);

    if (!seller) {
      this.logger.warn(
        {
          event: 'notification.recipient.missing',
          sellerId,
        },
        'Unable to resolve notification recipient',
      );
      throw new NotFoundException('Notification recipient not found');
    }

    return seller;
  }

  private resolveDeliveryAddress(recipientEmail: string): string {
    const overrideAddress = this.configService
      .get<string>('NOTIFICATIONS_TEST_RECIPIENT')
      ?.trim();

    return overrideAddress || recipientEmail;
  }
}
