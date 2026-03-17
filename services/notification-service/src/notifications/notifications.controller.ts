import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ArticleNotificationDto } from '../dto/article-notification.dto';
import { InternalAuthGuard } from '../internal/internal-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('internal/notifications')
@UseGuards(InternalAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('article-approved')
  sendArticleApproved(@Body() body: ArticleNotificationDto) {
    return this.notificationsService.sendArticleApprovedNotification(body);
  }

  @Post('article-rejected')
  sendArticleRejected(@Body() body: ArticleNotificationDto) {
    return this.notificationsService.sendArticleRejectedNotification(body);
  }
}
