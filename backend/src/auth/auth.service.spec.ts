import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PinoLogger } from 'nestjs-pino';
import { AuditService } from '../audit/audit.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let auditService: jest.Mocked<Pick<AuditService, 'record'>>;
  let logger: jest.Mocked<
    Pick<PinoLogger, 'setContext' | 'error' | 'info' | 'warn'>
  >;

  const baseUser: User = {
    id: 'user-id',
    email: 'seller@collector.local',
    passwordHash: bcrypt.hashSync('Seller123!', 10),
    role: Role.seller,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    auditService = {
      record: jest.fn().mockResolvedValue(undefined),
    };

    logger = {
      setContext: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      auditService as unknown as AuditService,
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns token and user when credentials are valid', async () => {
    usersService.findByEmail.mockResolvedValue(baseUser);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await expect(
      authService.login({
        email: 'seller@collector.local',
        password: 'Seller123!',
      }),
    ).resolves.toEqual({
      accessToken: 'jwt-token',
      user: {
        id: baseUser.id,
        email: baseUser.email,
        role: baseUser.role,
      },
    });
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'auth.login.succeeded',
        userId: baseUser.id,
        role: baseUser.role,
      }),
      'Login succeeded',
    );
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'LOGIN_SUCCEEDED',
        actorId: baseUser.id,
        actorRole: baseUser.role,
        resourceType: 'AUTH_SESSION',
      }),
    );
  });

  it('throws UnauthorizedException when user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'missing@collector.local',
        password: 'invalid',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'auth.login.failed',
        email: 'missing@collector.local',
      }),
      'Login failed',
    );
    const failedAuditCall = auditService.record.mock.calls[0]?.[0] as
      | {
          action: string;
          resourceType: string;
          metadata?: {
            email?: string;
          };
        }
      | undefined;

    expect(failedAuditCall).toMatchObject({
      action: 'LOGIN_FAILED',
      resourceType: 'AUTH_SESSION',
      metadata: {
        email: 'missing@collector.local',
      },
    });
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    usersService.findByEmail.mockResolvedValue(baseUser);

    await expect(
      authService.login({
        email: 'seller@collector.local',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when password hash is missing', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...baseUser,
      passwordHash: '',
    });

    await expect(
      authService.login({
        email: baseUser.email,
        password: 'Seller123!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('normalizes email before querying user store', async () => {
    usersService.findByEmail.mockResolvedValue(baseUser);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await authService.login({
      email: '  SELLER@collector.local  ',
      password: 'Seller123!',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith(
      'seller@collector.local',
    );
  });

  it('throws UnauthorizedException when password comparison throws unexpectedly', async () => {
    usersService.findByEmail.mockResolvedValue(baseUser);

    await expect(
      authService.login({
        email: baseUser.email,
        password: undefined as unknown as string,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
