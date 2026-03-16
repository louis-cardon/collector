import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { AuditClientService } from '../audit/audit-client.service';
import { InternalAuthGuard } from '../internal/internal-auth.guard';
import { NotificationsClientService } from '../notifications/notifications-client.service';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('internal')
@UseGuards(InternalAuthGuard)
export class InternalArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly auditClient: AuditClientService,
    private readonly notificationsClient: NotificationsClientService,
  ) {}

  @Post('articles')
  async createArticle(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Body() body: CreateArticleDto,
  ) {
    const article = await this.articlesService.create(body, userId);

    await this.auditClient.record({
      action: 'ITEM_CREATED',
      actorId: userId,
      actorRole: userRole,
      resourceType: 'ARTICLE',
      resourceId: article.id,
      metadata: {
        categoryId: article.categoryId,
        status: article.status,
        title: article.title,
      },
    });

    return article;
  }

  @Get('admin/articles/pending')
  findPending() {
    return this.articlesService.findPending();
  }

  @Post('admin/articles/:id/approve')
  async approve(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    const article = await this.articlesService.approve(id, userId);

    await this.auditClient.record({
      action: 'ITEM_APPROVED',
      actorId: userId,
      actorRole: userRole,
      resourceType: 'ARTICLE',
      resourceId: article.id,
      metadata: {
        sellerId: article.sellerId,
        status: article.status,
      },
    });

    await this.notificationsClient.sendApproved({
      articleId: article.id,
      sellerId: article.sellerId,
      title: article.title,
    });

    return article;
  }

  @Post('admin/articles/:id/reject')
  async reject(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    const article = await this.articlesService.reject(id, userId);

    await this.auditClient.record({
      action: 'ITEM_REJECTED',
      actorId: userId,
      actorRole: userRole,
      resourceType: 'ARTICLE',
      resourceId: article.id,
      metadata: {
        sellerId: article.sellerId,
        status: article.status,
      },
    });

    await this.notificationsClient.sendRejected({
      articleId: article.id,
      sellerId: article.sellerId,
      title: article.title,
    });

    return article;
  }
}
