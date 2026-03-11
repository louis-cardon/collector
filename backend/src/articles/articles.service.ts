import { BadRequestException, Injectable } from '@nestjs/common';
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
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
