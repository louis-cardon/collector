import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuditAction, Role } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ArticlesService } from '../articles/articles.service';
import { ArticleResponseDto } from '../articles/dto/article-response.dto';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('admin-articles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller('admin/articles')
export class AdminArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AdminArticlesController.name);
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending articles for review (admin only)' })
  @ApiOkResponse({ type: ArticleResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async findPending(): Promise<ArticleResponseDto[]> {
    const articles = await this.articlesService.findPending();
    return articles.map((article) =>
      this.articlesService.toResponseDto(article),
    );
  }

  @Post(':id/approve')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve a pending article (admin only)' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiConflictResponse({ description: 'Article already reviewed' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    const article = await this.articlesService.approve(id, user.id);

    await this.auditService.record({
      action: AuditAction.ITEM_APPROVED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'ARTICLE',
      resourceId: article.id,
      metadata: {
        sellerId: article.sellerId,
        status: article.status,
      },
    });
    await this.notificationsService.sendArticleApprovedNotification(article);

    this.logger.info(
      {
        event: 'admin.article.approved',
        articleId: article.id,
        userId: user.id,
        role: user.role,
        status: article.status,
      },
      'Admin approved article',
    );

    return this.articlesService.toResponseDto(article);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reject a pending article (admin only)' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiConflictResponse({ description: 'Article already reviewed' })
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    const article = await this.articlesService.reject(id, user.id);

    await this.auditService.record({
      action: AuditAction.ITEM_REJECTED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'ARTICLE',
      resourceId: article.id,
      metadata: {
        sellerId: article.sellerId,
        status: article.status,
      },
    });
    await this.notificationsService.sendArticleRejectedNotification(article);

    this.logger.info(
      {
        event: 'admin.article.rejected',
        articleId: article.id,
        userId: user.id,
        role: user.role,
        status: article.status,
      },
      'Admin rejected article',
    );

    return this.articlesService.toResponseDto(article);
  }
}
