import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AuthUserDto } from '../src/auth/dto/auth-user.dto';
import { LoginResponseDto } from '../src/auth/dto/login-response.dto';
import { UsersService } from '../src/users/users.service';

describe('Auth API (integration)', () => {
  let app: import('@nestjs/common').INestApplication<App>;

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

  beforeAll(async () => {
    process.env.JWT_SECRET = 'integration-test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    usersServiceMock.findByEmail.mockClear();
    usersServiceMock.findById.mockClear();
  });

  it('POST /auth/login returns token when credentials are valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: sellerUser.email, password: 'Seller123!' })
      .expect(200);

    const responseBody = response.body as LoginResponseDto;

    expect(responseBody.accessToken.length).toBeGreaterThan(0);
    expect(responseBody.user).toEqual({
      id: sellerUser.id,
      email: sellerUser.email,
      role: sellerUser.role,
    });
  });

  it('POST /auth/login returns 401 when credentials are invalid', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: sellerUser.email, password: 'WrongPassword!' })
      .expect(401);
  });

  it('GET /auth/me returns user when token is valid', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: 'Admin123!' })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponseDto;
    const token = loginBody.accessToken;

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const meBody = meResponse.body as AuthUserDto;

    expect(meBody).toEqual({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  it('GET /auth/me returns 401 when token is missing', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
