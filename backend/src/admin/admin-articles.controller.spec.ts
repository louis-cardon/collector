import { ArticleStatus, Prisma, Role } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { ArticlesService } from '../articles/articles.service';
import { AdminArticlesController } from './admin-articles.controller';

describe('AdminArticlesController', () => {
  let controller: AdminArticlesController;

  const pendingArticle = {
    id: 'article-id',
    title: 'Carte en attente',
    description: 'Annonce pending',
    price: new Prisma.Decimal('10.00'),
    shippingCost: new Prisma.Decimal('3.00'),
    status: ArticleStatus.PENDING_REVIEW,
    sellerId: 'seller-id',
    categoryId: 'category-id',
    reviewedAt: null,
    reviewedBy: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const responseDto = {
    id: 'article-id',
    title: 'Carte en attente',
    description: 'Annonce pending',
    price: '10.00',
    shippingCost: '3.00',
    status: ArticleStatus.PENDING_REVIEW,
    sellerId: 'seller-id',
    categoryId: 'category-id',
    reviewedAt: null,
    reviewedBy: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const articlesServiceMock = {
    findPending: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    toResponseDto: jest.fn(),
  };
  const loggerMock = {
    setContext: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminArticlesController(
      articlesServiceMock as unknown as ArticlesService,
      loggerMock as unknown as PinoLogger,
    );
  });

  it('findPending returns mapped pending articles', async () => {
    articlesServiceMock.findPending.mockResolvedValue([pendingArticle]);
    articlesServiceMock.toResponseDto.mockReturnValue(responseDto);

    await expect(controller.findPending()).resolves.toEqual([responseDto]);
    expect(articlesServiceMock.findPending).toHaveBeenCalledTimes(1);
    expect(articlesServiceMock.toResponseDto).toHaveBeenCalledWith(
      pendingArticle,
    );
  });

  it('approve delegates decision to ArticlesService with admin id', async () => {
    articlesServiceMock.approve.mockResolvedValue(pendingArticle);
    articlesServiceMock.toResponseDto.mockReturnValue(responseDto);

    await expect(
      controller.approve('article-id', {
        id: 'admin-id',
        email: 'admin@collector.local',
        role: Role.admin,
      }),
    ).resolves.toEqual(responseDto);

    expect(articlesServiceMock.approve).toHaveBeenCalledWith(
      'article-id',
      'admin-id',
    );
  });

  it('reject delegates decision to ArticlesService with admin id', async () => {
    articlesServiceMock.reject.mockResolvedValue({
      ...pendingArticle,
      status: ArticleStatus.REJECTED,
    });
    articlesServiceMock.toResponseDto.mockReturnValue({
      ...responseDto,
      status: ArticleStatus.REJECTED,
    });

    await expect(
      controller.reject('article-id', {
        id: 'admin-id',
        email: 'admin@collector.local',
        role: Role.admin,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: ArticleStatus.REJECTED,
      }),
    );

    expect(articlesServiceMock.reject).toHaveBeenCalledWith(
      'article-id',
      'admin-id',
    );
  });
});
