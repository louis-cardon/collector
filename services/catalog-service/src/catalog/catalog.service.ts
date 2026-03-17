import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  findCategories() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  findCatalog(categoryId?: string) {
    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.APPROVED,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.prisma.article.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findCatalogItem(id: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        status: ArticleStatus.APPROVED,
      },
    });

    if (!article) {
      throw new NotFoundException('Catalog article not found');
    }

    return article;
  }

  createCategory(name: string) {
    return this.prisma.category.create({
      data: {
        name: name.trim(),
      },
    });
  }

  updateCategory(id: string, name: string) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });
  }
}
