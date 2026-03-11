import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
  let service: ArticlesService;

  const prismaMock = {
    category: {
      findUnique: jest.fn(),
    },
    article: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ArticlesService(prismaMock as never);
  });

  it('creates an article with PENDING_REVIEW status linked to the seller', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 'category-id' });
    prismaMock.article.create.mockResolvedValue({
      id: 'article-id',
      title: 'Carte rare',
      description: 'Description détaillée de la carte.',
      price: new Prisma.Decimal('49.90'),
      shippingCost: new Prisma.Decimal('5.00'),
      status: ArticleStatus.PENDING_REVIEW,
      sellerId: 'seller-id',
      categoryId: 'category-id',
      reviewedAt: null,
      reviewedBy: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(
      service.create(
        {
          title: ' Carte rare ',
          description: ' Description détaillée de la carte. ',
          price: 49.9,
          shippingCost: 5,
          categoryId: 'category-id',
        },
        'seller-id',
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'article-id',
        status: ArticleStatus.PENDING_REVIEW,
        sellerId: 'seller-id',
        categoryId: 'category-id',
      }),
    );

    expect(prismaMock.article.create).toHaveBeenCalledWith({
      data: {
        title: 'Carte rare',
        description: 'Description détaillée de la carte.',
        price: 49.9,
        shippingCost: 5,
        status: ArticleStatus.PENDING_REVIEW,
        sellerId: 'seller-id',
        categoryId: 'category-id',
      },
    });
  });

  it('throws BadRequestException when category does not exist', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(
      service.create(
        {
          title: 'Carte rare',
          description: 'Description détaillée de la carte.',
          price: 49.9,
          shippingCost: 5,
          categoryId: 'missing-category',
        },
        'seller-id',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.article.create).not.toHaveBeenCalled();
  });

  it('lists only pending articles ordered by creation date', async () => {
    prismaMock.article.findMany.mockResolvedValue([]);

    await service.findPending();

    expect(prismaMock.article.findMany).toHaveBeenCalledWith({
      where: { status: ArticleStatus.PENDING_REVIEW },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('approves a pending article and records reviewer metadata', async () => {
    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-id',
      status: ArticleStatus.PENDING_REVIEW,
    });
    prismaMock.article.update.mockResolvedValue({
      id: 'article-id',
      title: 'Carte rare',
      description: 'Description détaillée de la carte.',
      price: new Prisma.Decimal('49.90'),
      shippingCost: new Prisma.Decimal('5.00'),
      status: ArticleStatus.APPROVED,
      sellerId: 'seller-id',
      categoryId: 'category-id',
      reviewedAt: new Date('2026-01-01T10:00:00.000Z'),
      reviewedBy: 'admin-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    });

    const article = await service.approve('article-id', 'admin-id');

    expect(article.status).toBe(ArticleStatus.APPROVED);
    expect(article.reviewedBy).toBe('admin-id');
    const updateCalls = prismaMock.article.update.mock.calls as Array<
      [
        {
          where: { id: string };
          data: {
            status: ArticleStatus;
            reviewedAt: Date;
            reviewedBy: string;
          };
        },
      ]
    >;
    const firstUpdateCall = updateCalls[0]?.[0];

    expect(firstUpdateCall?.where.id).toBe('article-id');
    expect(firstUpdateCall?.data.status).toBe(ArticleStatus.APPROVED);
    expect(firstUpdateCall?.data.reviewedBy).toBe('admin-id');
    expect(firstUpdateCall?.data.reviewedAt).toBeInstanceOf(Date);
  });

  it('rejects a pending article and records reviewer metadata', async () => {
    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-id',
      status: ArticleStatus.PENDING_REVIEW,
    });
    prismaMock.article.update.mockResolvedValue({
      id: 'article-id',
      title: 'Carte rare',
      description: 'Description détaillée de la carte.',
      price: new Prisma.Decimal('49.90'),
      shippingCost: new Prisma.Decimal('5.00'),
      status: ArticleStatus.REJECTED,
      sellerId: 'seller-id',
      categoryId: 'category-id',
      reviewedAt: new Date('2026-01-01T10:00:00.000Z'),
      reviewedBy: 'admin-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    });

    const article = await service.reject('article-id', 'admin-id');

    expect(article.status).toBe(ArticleStatus.REJECTED);
    expect(article.reviewedBy).toBe('admin-id');
    const updateCalls = prismaMock.article.update.mock.calls as Array<
      [
        {
          where: { id: string };
          data: {
            status: ArticleStatus;
            reviewedAt: Date;
            reviewedBy: string;
          };
        },
      ]
    >;
    const firstUpdateCall = updateCalls[0]?.[0];

    expect(firstUpdateCall?.where.id).toBe('article-id');
    expect(firstUpdateCall?.data.status).toBe(ArticleStatus.REJECTED);
    expect(firstUpdateCall?.data.reviewedBy).toBe('admin-id');
    expect(firstUpdateCall?.data.reviewedAt).toBeInstanceOf(Date);
  });

  it('throws ConflictException when trying to reprocess an already reviewed article', async () => {
    prismaMock.article.findUnique.mockResolvedValue({
      id: 'article-id',
      status: ArticleStatus.APPROVED,
    });

    await expect(
      service.reject('article-id', 'admin-id'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.article.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when article does not exist during review', async () => {
    prismaMock.article.findUnique.mockResolvedValue(null);

    await expect(
      service.approve('missing-article', 'admin-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps Article entity to response dto with money as fixed strings', () => {
    const dto = service.toResponseDto({
      id: 'article-id',
      title: 'Carte rare',
      description: 'Description détaillée de la carte.',
      price: new Prisma.Decimal('49.9'),
      shippingCost: new Prisma.Decimal('5'),
      status: ArticleStatus.PENDING_REVIEW,
      sellerId: 'seller-id',
      categoryId: 'category-id',
      reviewedAt: null,
      reviewedBy: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(dto).toEqual(
      expect.objectContaining({
        price: '49.90',
        shippingCost: '5.00',
        reviewedAt: null,
        reviewedBy: null,
      }),
    );
  });
});
