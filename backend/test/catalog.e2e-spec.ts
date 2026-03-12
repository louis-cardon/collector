import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Article, ArticleStatus, Prisma } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Catalog API (integration)', () => {
  let app: INestApplication;
  let httpApp: Parameters<typeof request>[0];

  const articles = new Map<string, Article>();

  const prismaServiceMock = {
    article: {
      findMany: jest.fn(
        ({
          where,
          orderBy,
        }: {
          where: { status: ArticleStatus; categoryId?: string };
          orderBy: { createdAt: 'asc' | 'desc' };
        }) => {
          const values = [...articles.values()].filter((article) => {
            const hasStatus = article.status === where.status;
            const hasCategory = where.categoryId
              ? article.categoryId === where.categoryId
              : true;

            return hasStatus && hasCategory;
          });

          if (orderBy.createdAt === 'desc') {
            values.sort(
              (left, right) =>
                right.createdAt.getTime() - left.createdAt.getTime(),
            );
          }

          if (orderBy.createdAt === 'asc') {
            values.sort(
              (left, right) =>
                left.createdAt.getTime() - right.createdAt.getTime(),
            );
          }

          return Promise.resolve(values);
        },
      ),
      findFirst: jest.fn(
        ({ where }: { where: { id: string; status: ArticleStatus } }) => {
          const article = articles.get(where.id);

          if (!article || article.status !== where.status) {
            return Promise.resolve(null);
          }

          return Promise.resolve(article);
        },
      ),
    },
  };

  const seedArticles = () => {
    articles.clear();

    const baseDate = new Date('2026-01-01T00:00:00.000Z');

    const seeded: Article[] = [
      {
        id: 'article-approved-1',
        title: 'Carte approuvée 1',
        description: 'Annonce approuvée visible publiquement',
        price: new Prisma.Decimal('30.00'),
        shippingCost: new Prisma.Decimal('5.00'),
        status: ArticleStatus.APPROVED,
        sellerId: 'seller-id',
        categoryId: 'category-1',
        reviewedAt: new Date('2026-01-02T00:00:00.000Z'),
        reviewedBy: 'admin-id',
        createdAt: new Date(baseDate.getTime()),
        updatedAt: new Date(baseDate.getTime() + 1000),
      },
      {
        id: 'article-approved-2',
        title: 'Carte approuvée 2',
        description: 'Annonce approuvée d’une autre catégorie',
        price: new Prisma.Decimal('12.00'),
        shippingCost: new Prisma.Decimal('2.50'),
        status: ArticleStatus.APPROVED,
        sellerId: 'seller-id',
        categoryId: 'category-2',
        reviewedAt: new Date('2026-01-02T00:00:00.000Z'),
        reviewedBy: 'admin-id',
        createdAt: new Date(baseDate.getTime() + 2000),
        updatedAt: new Date(baseDate.getTime() + 3000),
      },
      {
        id: 'article-pending',
        title: 'Carte pending',
        description: 'Annonce en attente',
        price: new Prisma.Decimal('20.00'),
        shippingCost: new Prisma.Decimal('4.00'),
        status: ArticleStatus.PENDING_REVIEW,
        sellerId: 'seller-id',
        categoryId: 'category-1',
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(baseDate.getTime() + 4000),
        updatedAt: new Date(baseDate.getTime() + 5000),
      },
      {
        id: 'article-rejected',
        title: 'Carte rejected',
        description: 'Annonce rejetée',
        price: new Prisma.Decimal('10.00'),
        shippingCost: new Prisma.Decimal('3.00'),
        status: ArticleStatus.REJECTED,
        sellerId: 'seller-id',
        categoryId: 'category-1',
        reviewedAt: new Date('2026-01-02T00:00:00.000Z'),
        reviewedBy: 'admin-id',
        createdAt: new Date(baseDate.getTime() + 6000),
        updatedAt: new Date(baseDate.getTime() + 7000),
      },
    ];

    for (const article of seeded) {
      articles.set(article.id, article);
    }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    const expressApp = app.getHttpAdapter().getInstance() as (
      req: unknown,
      res: unknown,
    ) => void;
    httpApp = ((req, res) => expressApp(req, res)) as Parameters<
      typeof request
    >[0];
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    prismaServiceMock.article.findMany.mockClear();
    prismaServiceMock.article.findFirst.mockClear();

    seedArticles();
  });

  it('shows APPROVED articles in public catalog', async () => {
    const response = await request(httpApp).get('/catalog').expect(200);

    const body = response.body as Array<{ id: string; title: string }>;

    expect(body.map((article) => article.id)).toContain('article-approved-1');
    expect(body.map((article) => article.id)).toContain('article-approved-2');
  });

  it('does not show PENDING_REVIEW articles in public catalog', async () => {
    const response = await request(httpApp).get('/catalog').expect(200);

    const ids = (response.body as Array<{ id: string }>).map(
      (article) => article.id,
    );

    expect(ids).not.toContain('article-pending');
  });

  it('does not show REJECTED articles in public catalog', async () => {
    const response = await request(httpApp).get('/catalog').expect(200);

    const ids = (response.body as Array<{ id: string }>).map(
      (article) => article.id,
    );

    expect(ids).not.toContain('article-rejected');
  });

  it('is publicly accessible without JWT and hides sensitive fields', async () => {
    const response = await request(httpApp).get('/catalog').expect(200);

    const first = (response.body as Array<Record<string, unknown>>)[0];

    expect(first).toBeDefined();
    expect(first).not.toHaveProperty('sellerId');
    expect(first).not.toHaveProperty('status');
    expect(first).not.toHaveProperty('reviewedBy');
    expect(first).not.toHaveProperty('reviewedAt');
  });

  it('supports categoryId filter', async () => {
    const response = await request(httpApp)
      .get('/catalog')
      .query({ categoryId: 'category-1' })
      .expect(200);

    const ids = (response.body as Array<{ id: string }>).map(
      (article) => article.id,
    );

    expect(ids).toEqual(['article-approved-1']);
  });

  it('GET /catalog/:id returns 404 when article is not APPROVED', async () => {
    await request(httpApp).get('/catalog/article-pending').expect(404);
    await request(httpApp).get('/catalog/article-rejected').expect(404);
  });

  it('GET /catalog/:id returns approved article publicly', async () => {
    const response = await request(httpApp)
      .get('/catalog/article-approved-1')
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: 'article-approved-1',
        title: 'Carte approuvée 1',
      }),
    );
    expect(response.body).not.toHaveProperty('sellerId');
    expect(response.body).not.toHaveProperty('status');
  });
});
