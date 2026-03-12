import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  const createContext = (role?: Role): ExecutionContext =>
    ({
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: role
            ? {
                id: 'user-id',
                email: 'user@collector.local',
                role,
              }
            : undefined,
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };

    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows request when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext(Role.seller))).toBe(true);
  });

  it('allows request when user role matches required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.admin]);

    expect(guard.canActivate(createContext(Role.admin))).toBe(true);
  });

  it('rejects request when user role does not match required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.admin]);

    expect(guard.canActivate(createContext(Role.seller))).toBe(false);
  });

  it('rejects request when user is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.admin]);

    expect(guard.canActivate(createContext())).toBe(false);
  });
});
