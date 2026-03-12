import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Article, ArticleStatus, Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LoginResponseDto } from '../src/auth/dto/login-response.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/users/users.service';

describe('Admin Articles API (integration)', () => {
  let app: INestApplication;
  let httpApp: Parameters<typeof request>[0];

  const sellerUser: User = {
    id: 'seller-id',
    email: 'seller@collector.local',
    passwordHash: bcrypt.hashSync('Seller123!', 10),
    role: Role.seller,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const adminUser: User = {
    id: 'admin-id',
    email: 'admin@collector.local',
    passwordHash: bcrypt.hashSync('Admin123!', 10),
    role: Role.admin,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const usersByEmail = new Map<string, User>([
    [sellerUser.email, sellerUser],
    [adminUser.email, adminUser],
  ]);

  const usersById = new Map<string, User>([
    [sellerUser.id, sellerUser],
    [adminUser.id, adminUser],
  ]);

  const usersServiceMock = {
    findByEmail: jest.fn((email: string) =>
      Promise.resolve(usersByEmail.get(email) ?? null),
    ),
    findById: jest.fn((id: string) =>
      Promise.resolve(usersById.get(id) ?? null),
    ),
  };

  const articles = new Map<string, Article>();

  const prismaServiceMock = {
    article: {
      findMany: jest.fn(
        ({
          where,
          orderBy,
        }: {
          where?: { status?: ArticleStatus };
          orderBy?: { createdAt?: 'asc' | 'desc' };
        }) => {
          const values = [...articles.values()].filter((article) => {
            if (where?.status) {
              return article.status === where.status;
            }

            return true;
          });

          if (orderBy?.createdAt === 'asc') {
            values.sort(
              (left, right) =>
                left.createdAt.getTime() - right.createdAt.getTime(),
            );
          }

          if (orderBy?.createdAt === 'desc') {
            values.sort(
              (left, right) =>
                right.createdAt.getTime() - left.createdAt.getTime(),
            );
          }

          return Promise.resolve(values);
        },
      ),
      findUnique: jest.fn(({ where }: { where: { id: string } }) => {
        const article = articles.get(where.id);

        if (!article) {
          return Promise.resolve(null);
        }

        return Promise.resolve({ id: article.id, status: article.status });
      }),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: string };
          data: {
            status: ArticleStatus;
            reviewedAt: Date;
            reviewedBy: string;
          };
        }) => {
          const existing = articles.get(where.id);

          if (!existing) {
            throw new Error('Article not found in update mock');
          }

          const updated: Article = {
            ...existing,
            status: data.status,
            reviewedAt: data.reviewedAt,
            reviewedBy: data.reviewedBy,
            updatedAt: new Date(),
          };

          articles.set(updated.id, updated);

          return Promise.resolve(updated);
        },
      ),
    },
  };

  const seedArticles = () => {
    articles.clear();

    const baseDate = new Date('2026-01-01T00:00:00.000Z');
    const reviewDate = new Date('2026-01-02T00:00:00.000Z');

    const seeded: Article[] = [
      {
        id: 'article-pending-1',
        title: 'Carte rare 1',
        description: 'Annonce en attente de validation 1',
        price: new Prisma.Decimal('25.00'),
        shippingCost: new Prisma.Decimal('4.00'),
        status: ArticleStatus.PENDING_REVIEW,
        sellerId: sellerUser.id,
        categoryId: 'category-1',
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(baseDate.getTime()),
        updatedAt: new Date(baseDate.getTime()),
      },
      {
        id: 'article-pending-2',
        title: 'Carte rare 2',
        description: 'Annonce en attente de validation 2',
        price: new Prisma.Decimal('30.00'),
        shippingCost: new Prisma.Decimal('5.00'),
        status: ArticleStatus.PENDING_REVIEW,
        sellerId: sellerUser.id,
        categoryId: 'category-1',
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(baseDate.getTime() + 1000),
        updatedAt: new Date(baseDate.getTime() + 1000),
      },
      {
        id: 'article-approved',
        title: 'Carte approuvée',
        description: 'Annonce déjà validée',
        price: new Prisma.Decimal('99.00'),
        shippingCost: new Prisma.Decimal('0.00'),
        status: ArticleStatus.APPROVED,
        sellerId: sellerUser.id,
        categoryId: 'category-1',
        reviewedAt: reviewDate,
        reviewedBy: adminUser.id,
        createdAt: new Date(baseDate.getTime() + 2000),
        updatedAt: reviewDate,
      },
      {
        id: 'article-rejected',
        title: 'Carte rejetée',
        description: 'Annonce déjà rejetée',
        price: new Prisma.Decimal('14.00'),
        shippingCost: new Prisma.Decimal('3.00'),
        status: ArticleStatus.REJECTED,
        sellerId: sellerUser.id,
        categoryId: 'category-1',
        reviewedAt: reviewDate,
        reviewedBy: adminUser.id,
        createdAt: new Date(baseDate.getTime() + 3000),
        updatedAt: reviewDate,
      },
    ];

    for (const article of seeded) {
      articles.set(article.id, article);
    }
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'integration-test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
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
    usersServiceMock.findByEmail.mockClear();
    usersServiceMock.findById.mockClear();
    prismaServiceMock.article.findMany.mockClear();
    prismaServiceMock.article.findUnique.mockClear();
    prismaServiceMock.article.update.mockClear();

    seedArticles();
  });

  const loginAndGetToken = async (
    email: string,
    password: string,
  ): Promise<string> => {
    const response = await request(httpApp)
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const body = response.body as LoginResponseDto;

    return body.accessToken;
  };

  it('lists pending articles for admin only', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    const response = await request(httpApp)
      .get('/admin/articles/pending')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = response.body as Array<{ id: string; status: ArticleStatus }>;

    expect(body).toHaveLength(2);
    expect(body.map((article) => article.id)).toEqual([
      'article-pending-1',
      'article-pending-2',
    ]);
    expect(
      body.every((article) => article.status === ArticleStatus.PENDING_REVIEW),
    ).toBe(true);
  });

  it('refuses pending listing for seller role', async () => {
    const sellerToken = await loginAndGetToken(sellerUser.email, 'Seller123!');

    await request(httpApp)
      .get('/admin/articles/pending')
      .set('Authorization', `Bearer ${sellerToken}`)
      .expect(403);
  });

  it('refuses pending listing without token', async () => {
    await request(httpApp).get('/admin/articles/pending').expect(401);
  });

  it('approves a pending article with admin role', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    const response = await request(httpApp)
      .post('/admin/articles/article-pending-1/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = response.body as {
      id: string;
      status: ArticleStatus;
      reviewedBy: string | null;
      reviewedAt: string | null;
    };

    expect(body.id).toBe('article-pending-1');
    expect(body.status).toBe(ArticleStatus.APPROVED);
    expect(body.reviewedBy).toBe(adminUser.id);
    expect(body.reviewedAt).not.toBeNull();
  });

  it('rejects a pending article with admin role', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    const response = await request(httpApp)
      .post('/admin/articles/article-pending-2/reject')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = response.body as {
      id: string;
      status: ArticleStatus;
      reviewedBy: string | null;
      reviewedAt: string | null;
    };

    expect(body.id).toBe('article-pending-2');
    expect(body.status).toBe(ArticleStatus.REJECTED);
    expect(body.reviewedBy).toBe(adminUser.id);
    expect(body.reviewedAt).not.toBeNull();
  });

  it('refuses approve and reject for seller role', async () => {
    const sellerToken = await loginAndGetToken(sellerUser.email, 'Seller123!');

    await request(httpApp)
      .post('/admin/articles/article-pending-1/approve')
      .set('Authorization', `Bearer ${sellerToken}`)
      .expect(403);

    await request(httpApp)
      .post('/admin/articles/article-pending-1/reject')
      .set('Authorization', `Bearer ${sellerToken}`)
      .expect(403);
  });

  it('refuses to reprocess an already decided article', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    await request(httpApp)
      .post('/admin/articles/article-approved/reject')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(409);
  });

  it('returns 404 when admin tries to review an unknown article', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    await request(httpApp)
      .post('/admin/articles/missing-article/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
