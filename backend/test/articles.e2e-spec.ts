import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Article,
  ArticleStatus,
  Category,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LoginResponseDto } from '../src/auth/dto/login-response.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/users/users.service';

describe('Articles API (integration)', () => {
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

  const categories = new Map<string, Category>();
  const articles = new Map<string, Article>();
  let categoryIndex = 0;
  let articleIndex = 0;

  const prismaServiceMock = {
    category: {
      findUnique: jest.fn(({ where }: { where: { id: string } }) => {
        const category = categories.get(where.id);

        if (!category) {
          return Promise.resolve(null);
        }

        return Promise.resolve({ id: category.id });
      }),
    },
    article: {
      create: jest.fn(
        ({
          data,
        }: {
          data: {
            title: string;
            description: string;
            price: number;
            shippingCost: number;
            status: ArticleStatus;
            sellerId: string;
            categoryId: string;
          };
        }) => {
          const now = new Date();
          const article: Article = {
            id: `article-${++articleIndex}`,
            title: data.title,
            description: data.description,
            price: new Prisma.Decimal(data.price),
            shippingCost: new Prisma.Decimal(data.shippingCost),
            status: data.status,
            sellerId: data.sellerId,
            categoryId: data.categoryId,
            reviewedAt: null,
            reviewedBy: null,
            createdAt: now,
            updatedAt: now,
          };

          articles.set(article.id, article);

          return Promise.resolve(article);
        },
      ),
    },
  };

  const seedCategories = () => {
    categories.clear();
    articles.clear();
    categoryIndex = 0;
    articleIndex = 0;

    const now = new Date('2026-01-01T00:00:00.000Z');

    const initialCategories: Category[] = [
      {
        id: `category-${++categoryIndex}`,
        name: 'Cartes',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `category-${++categoryIndex}`,
        name: 'Figurines',
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const category of initialCategories) {
      categories.set(category.id, category);
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
    prismaServiceMock.category.findUnique.mockClear();
    prismaServiceMock.article.create.mockClear();

    seedCategories();
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

  it('creates an article with seller role and status PENDING_REVIEW', async () => {
    const sellerToken = await loginAndGetToken(sellerUser.email, 'Seller123!');
    const existingCategoryId = [...categories.values()][0].id;

    const response = await request(httpApp)
      .post('/articles')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'Carte Dragon Ball édition spéciale',
        description: 'Carte collector en excellent état, sleeve fournie.',
        price: 79.9,
        shippingCost: 4.5,
        categoryId: existingCategoryId,
      })
      .expect(201);

    const body = response.body as {
      status: ArticleStatus;
      sellerId: string;
      categoryId: string;
      price: string;
      shippingCost: string;
    };

    expect(body.status).toBe(ArticleStatus.PENDING_REVIEW);
    expect(body.sellerId).toBe(sellerUser.id);
    expect(body.categoryId).toBe(existingCategoryId);
    expect(body.price).toBe('79.90');
    expect(body.shippingCost).toBe('4.50');

    const firstCreateCall = prismaServiceMock.article.create.mock
      .calls[0]?.[0] as
      | {
          data: {
            status: ArticleStatus;
            sellerId: string;
          };
        }
      | undefined;

    expect(firstCreateCall).toBeDefined();
    expect(firstCreateCall?.data.status).toBe(ArticleStatus.PENDING_REVIEW);
    expect(firstCreateCall?.data.sellerId).toBe(sellerUser.id);
  });

  it('refuses article creation without token', async () => {
    const existingCategoryId = [...categories.values()][0].id;

    await request(httpApp)
      .post('/articles')
      .send({
        title: 'Carte Dragon Ball édition spéciale',
        description: 'Carte collector en excellent état, sleeve fournie.',
        price: 79.9,
        shippingCost: 4.5,
        categoryId: existingCategoryId,
      })
      .expect(401);
  });

  it('refuses article creation for admin role', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');
    const existingCategoryId = [...categories.values()][0].id;

    await request(httpApp)
      .post('/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Carte Dragon Ball édition spéciale',
        description: 'Carte collector en excellent état, sleeve fournie.',
        price: 79.9,
        shippingCost: 4.5,
        categoryId: existingCategoryId,
      })
      .expect(403);
  });

  it('refuses article creation when category does not exist', async () => {
    const sellerToken = await loginAndGetToken(sellerUser.email, 'Seller123!');

    await request(httpApp)
      .post('/articles')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'Carte Dragon Ball édition spéciale',
        description: 'Carte collector en excellent état, sleeve fournie.',
        price: 79.9,
        shippingCost: 4.5,
        categoryId: 'missing-category',
      })
      .expect(400);
  });
});
