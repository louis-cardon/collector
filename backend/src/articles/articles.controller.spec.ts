import { ArticleStatus, Prisma, Role } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;

  const articleEntity = {
    id: 'article-id',
    title: 'Carte rare',
    description: 'Description detaillee',
    price: new Prisma.Decimal('79.90'),
    shippingCost: new Prisma.Decimal('4.50'),
    status: ArticleStatus.PENDING_REVIEW,
    sellerId: 'seller-id',
    categoryId: 'category-id',
    reviewedAt: null,
    reviewedBy: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const articleResponse = {
    id: 'article-id',
    title: 'Carte rare',
    description: 'Description detaillee',
    price: '79.90',
    shippingCost: '4.50',
    status: ArticleStatus.PENDING_REVIEW,
    sellerId: 'seller-id',
    categoryId: 'category-id',
    reviewedAt: null,
    reviewedBy: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const articlesServiceMock = {
    create: jest.fn(),
    toResponseDto: jest.fn(),
  };
  const loggerMock = {
    setContext: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ArticlesController(
      articlesServiceMock as unknown as ArticlesService,
      loggerMock as unknown as PinoLogger,
    );
  });

  it('create delegates to ArticlesService and returns mapped dto', async () => {
    articlesServiceMock.create.mockResolvedValue(articleEntity);
    articlesServiceMock.toResponseDto.mockReturnValue(articleResponse);

    await expect(
      controller.create(
        {
          id: 'seller-id',
          email: 'seller@collector.local',
          role: Role.seller,
        },
        {
          title: 'Carte rare',
          description: 'Description detaillee',
          price: 79.9,
          shippingCost: 4.5,
          categoryId: 'category-id',
        },
      ),
    ).resolves.toEqual(articleResponse);

    expect(articlesServiceMock.create).toHaveBeenCalledWith(
      {
        title: 'Carte rare',
        description: 'Description detaillee',
        price: 79.9,
        shippingCost: 4.5,
        categoryId: 'category-id',
      },
      'seller-id',
    );
    expect(articlesServiceMock.toResponseDto).toHaveBeenCalledWith(
      articleEntity,
    );
  });
});
