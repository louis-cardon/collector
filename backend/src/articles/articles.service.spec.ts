import { BadRequestException } from '@nestjs/common';
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
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(dto).toEqual(
      expect.objectContaining({
        price: '49.90',
        shippingCost: '5.00',
      }),
    );
  });
});
