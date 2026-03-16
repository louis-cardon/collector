import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, sellerId: string) {
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

  findPending() {
    return this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PENDING_REVIEW,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  approve(articleId: string, reviewerId: string) {
    return this.review(articleId, reviewerId, ArticleStatus.APPROVED);
  }

  reject(articleId: string, reviewerId: string) {
    return this.review(articleId, reviewerId, ArticleStatus.REJECTED);
  }

  private async review(
    articleId: string,
    reviewerId: string,
    targetStatus: ArticleStatus,
  ) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        status: true,
      },
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
}
