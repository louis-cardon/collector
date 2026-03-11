import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Article, ArticleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createArticleDto: CreateArticleDto,
    sellerId: string,
  ): Promise<Article> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: createArticleDto.categoryId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    return this.prisma.article.create({
      data: {
        title: createArticleDto.title.trim(),
        description: createArticleDto.description.trim(),
        price: createArticleDto.price,
        shippingCost: createArticleDto.shippingCost,
        status: ArticleStatus.PENDING_REVIEW,
        sellerId,
        categoryId: createArticleDto.categoryId,
      },
    });
  }

  findPending(): Promise<Article[]> {
    return this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PENDING_REVIEW,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  approve(articleId: string, reviewerId: string): Promise<Article> {
    return this.review(articleId, reviewerId, ArticleStatus.APPROVED);
  }

  reject(articleId: string, reviewerId: string): Promise<Article> {
    return this.review(articleId, reviewerId, ArticleStatus.REJECTED);
  }

  private async review(
    articleId: string,
    reviewerId: string,
    targetStatus: ArticleStatus,
  ): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.status !== ArticleStatus.PENDING_REVIEW) {
      throw new ConflictException('Article already reviewed');
    }

    return this.prisma.article.update({
      where: { id: articleId },
      data: {
        status: targetStatus,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
    });
  }

  toResponseDto(article: Article): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      price: article.price.toFixed(2),
      shippingCost: article.shippingCost.toFixed(2),
      status: article.status,
      sellerId: article.sellerId,
      categoryId: article.categoryId,
      reviewedAt: article.reviewedAt,
      reviewedBy: article.reviewedBy,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
