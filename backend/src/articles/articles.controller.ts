import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
import { ArticlesService } from './articles.service';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly auditService: AuditService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ArticlesController.name);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.seller)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an article (seller only)' })
  @ApiCreatedResponse({ type: ArticleResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload or unknown category' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Seller role required' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articlesService.create(
      createArticleDto,
      user.id,
    );
    await this.auditService.record({
      action: AuditAction.ITEM_CREATED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'ARTICLE',
      resourceId: article.id,
      metadata: {
        categoryId: article.categoryId,
        status: article.status,
        title: article.title,
      },
    });

    this.logger.info(
      {
        event: 'article.created',
        articleId: article.id,
        userId: user.id,
        role: user.role,
        status: article.status,
      },
      'Article created',
    );

    return this.articlesService.toResponseDto(article);
  }
}
