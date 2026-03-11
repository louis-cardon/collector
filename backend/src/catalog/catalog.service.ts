import { Injectable, NotFoundException } from '@nestjs/common';
import { Article, ArticleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogArticleDto } from './dto/catalog-article.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoryId?: string): Promise<CatalogArticleDto[]> {
    const articles = await this.prisma.article.findMany({
      where: this.buildApprovedWhere(categoryId),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return articles.map((article) => this.toCatalogDto(article));
  }

  async findOne(id: string): Promise<CatalogArticleDto> {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        status: ArticleStatus.APPROVED,
      },
    });

    if (!article) {
      throw new NotFoundException('Catalog article not found');
    }

    return this.toCatalogDto(article);
  }

  private buildApprovedWhere(categoryId?: string): Prisma.ArticleWhereInput {
    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.APPROVED,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    return where;
  }

  private toCatalogDto(article: Article): CatalogArticleDto {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      price: article.price.toFixed(2),
      shippingCost: article.shippingCost.toFixed(2),
      categoryId: article.categoryId,
      createdAt: article.createdAt,
    };
  }
}
