import { NotFoundException } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  const prismaMock = {
    article: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CatalogService(prismaMock as never);
  });

  it('lists approved articles without exposing sensitive fields', async () => {
    prismaMock.article.findMany.mockResolvedValue([
      {
        id: 'article-approved',
        title: 'Carte approuvée',
        description: 'Visible dans le catalogue public',
        price: new Prisma.Decimal('29.90'),
        shippingCost: new Prisma.Decimal('4.50'),
        status: ArticleStatus.APPROVED,
        sellerId: 'seller-id',
        categoryId: 'category-1',
        reviewedAt: new Date('2026-01-02T00:00:00.000Z'),
        reviewedBy: 'admin-id',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ]);

    const result = await service.findAll();

    expect(prismaMock.article.findMany).toHaveBeenCalledWith({
      where: { status: ArticleStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([
      {
        id: 'article-approved',
        title: 'Carte approuvée',
        description: 'Visible dans le catalogue public',
        price: '29.90',
        shippingCost: '4.50',
        categoryId: 'category-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);
  });

  it('supports category filter on listing', async () => {
    prismaMock.article.findMany.mockResolvedValue([]);

    await service.findAll('category-1');

    expect(prismaMock.article.findMany).toHaveBeenCalledWith({
      where: {
        status: ArticleStatus.APPROVED,
        categoryId: 'category-1',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('gets one approved article by id', async () => {
    prismaMock.article.findFirst.mockResolvedValue({
      id: 'article-approved',
      title: 'Carte approuvée',
      description: 'Visible dans le catalogue public',
      price: new Prisma.Decimal('29.90'),
      shippingCost: new Prisma.Decimal('4.50'),
      status: ArticleStatus.APPROVED,
      sellerId: 'seller-id',
      categoryId: 'category-1',
      reviewedAt: new Date('2026-01-02T00:00:00.000Z'),
      reviewedBy: 'admin-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const result = await service.findOne('article-approved');

    expect(prismaMock.article.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'article-approved',
        status: ArticleStatus.APPROVED,
      },
    });
    expect(result.id).toBe('article-approved');
    expect(result.price).toBe('29.90');
  });

  it('throws NotFoundException when article is not approved or missing', async () => {
    prismaMock.article.findFirst.mockResolvedValue(null);

    await expect(service.findOne('article-pending')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
