import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Category, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LoginResponseDto } from '../src/auth/dto/login-response.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/users/users.service';

describe('Categories API (integration)', () => {
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
  let categoryIndex = 0;
  const prismaError = (code: 'P2002' | 'P2025'): Error & { code: string } =>
    Object.assign(new Error(`Prisma error ${code}`), { code });

  const prismaServiceMock = {
    auditLog: {
      create: jest.fn(() => Promise.resolve({ id: 'audit-log-id' })),
    },
    category: {
      create: jest.fn(({ data }: { data: { name: string } }) => {
        const existing = [...categories.values()].find(
          (category) => category.name === data.name,
        );

        if (existing) {
          return Promise.reject(prismaError('P2002'));
        }

        const now = new Date();
        const createdCategory: Category = {
          id: `category-${++categoryIndex}`,
          name: data.name,
          createdAt: now,
          updatedAt: now,
        };

        categories.set(createdCategory.id, createdCategory);

        return Promise.resolve(createdCategory);
      }),
      findMany: jest.fn(() => {
        const values = [...categories.values()];
        values.sort((left, right) => left.name.localeCompare(right.name));

        return Promise.resolve(values);
      }),
      update: jest.fn(
        ({
          where,
          data,
        }: {
          where: { id: string };
          data: { name: string };
        }) => {
          const existing = categories.get(where.id);

          if (!existing) {
            return Promise.reject(prismaError('P2025'));
          }

          const duplicate = [...categories.values()].find(
            (category) =>
              category.name === data.name && category.id !== where.id,
          );

          if (duplicate) {
            return Promise.reject(prismaError('P2002'));
          }

          const updatedCategory: Category = {
            ...existing,
            name: data.name,
            updatedAt: new Date(),
          };

          categories.set(existing.id, updatedCategory);

          return Promise.resolve(updatedCategory);
        },
      ),
    },
  };

  const seedCategories = () => {
    categories.clear();
    categoryIndex = 0;

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
    prismaServiceMock.auditLog.create.mockClear();
    prismaServiceMock.category.create.mockClear();
    prismaServiceMock.category.findMany.mockClear();
    prismaServiceMock.category.update.mockClear();

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

  it('creates a category with admin role', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    const response = await request(httpApp)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Mangas' })
      .expect(201);

    const body = response.body as {
      id: string;
      name: string;
    };

    expect(typeof body.id).toBe('string');
    expect(body.name).toBe('Mangas');
  });

  it('refuses category creation for seller role', async () => {
    const sellerToken = await loginAndGetToken(sellerUser.email, 'Seller123!');

    await request(httpApp)
      .post('/categories')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Vinyles' })
      .expect(403);
  });

  it('lists categories publicly', async () => {
    const response = await request(httpApp).get('/categories').expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Cartes' }),
        expect.objectContaining({ name: 'Figurines' }),
      ]),
    );
  });

  it('rejects duplicate category name', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    await request(httpApp)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cartes' })
      .expect(409);
  });

  it('updates a category with admin role', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');
    const categoryId = [...categories.keys()][0];

    const response = await request(httpApp)
      .patch(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cartes retro' })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: categoryId,
        name: 'Cartes retro',
      }),
    );
  });

  it('refuses category update for seller role', async () => {
    const sellerToken = await loginAndGetToken(sellerUser.email, 'Seller123!');
    const categoryId = [...categories.keys()][0];

    await request(httpApp)
      .patch(`/categories/${categoryId}`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Cartes retro' })
      .expect(403);
  });

  it('returns 404 when updating an unknown category', async () => {
    const adminToken = await loginAndGetToken(adminUser.email, 'Admin123!');

    await request(httpApp)
      .patch('/categories/missing-category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Cartes retro' })
      .expect(404);
  });
});
