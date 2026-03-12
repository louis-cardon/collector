import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const configServiceMock = {
    getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
  };

  const usersServiceMock = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(
      configServiceMock as unknown as ConfigService,
      usersServiceMock as unknown as UsersService,
    );
  });

  it('returns authenticated user when payload sub matches an existing user', async () => {
    usersServiceMock.findById.mockResolvedValue({
      id: 'seller-id',
      email: 'seller@collector.local',
      passwordHash: 'hash',
      role: Role.seller,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(
      strategy.validate({
        sub: 'seller-id',
        email: 'seller@collector.local',
        role: Role.seller,
      }),
    ).resolves.toEqual({
      id: 'seller-id',
      email: 'seller@collector.local',
      role: Role.seller,
    });
    expect(usersServiceMock.findById).toHaveBeenCalledWith('seller-id');
  });

  it('throws UnauthorizedException when payload sub does not match a user', async () => {
    usersServiceMock.findById.mockResolvedValue(null);

    await expect(
      strategy.validate({
        sub: 'missing-user',
        email: 'missing@collector.local',
        role: Role.seller,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
