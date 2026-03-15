import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Article, ArticleStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { UsersService } from '../users/users.service';
import { EMAIL_NOTIFICATION_PROVIDER } from './notifications.constants';
import type { EmailNotificationProvider } from './notifications.types';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly usersService: UsersService,
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

    await this.provider.send({
      to: recipient.email,
      subject: `Annonce approuvee: ${article.title}`,
      text: `Votre annonce "${article.title}" (${article.id}) a ete approuvee.`,
    });

    this.logger.info(
      {
        event: 'notification.article.approved',
        articleId: article.id,
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

    await this.provider.send({
      to: recipient.email,
      subject: `Annonce rejetee: ${article.title}`,
      text: `Votre annonce "${article.title}" (${article.id}) a ete rejetee.`,
    });

    this.logger.info(
      {
        event: 'notification.article.rejected',
        articleId: article.id,
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
}
