import { Role } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    login: jest.fn(),
    toAuthUserDto: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authServiceMock as unknown as AuthService);
  });

  it('login delegates authentication to AuthService', async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: 'jwt-token',
      user: {
        id: 'seller-id',
        email: 'seller@collector.local',
        role: Role.seller,
      },
    });

    const response = await controller.login({
      email: 'seller@collector.local',
      password: 'Seller123!',
    });

    expect(response.accessToken).toBe('jwt-token');
    expect(response.user.role).toBe(Role.seller);
  });

  it('me delegates mapping to AuthService', () => {
    authServiceMock.toAuthUserDto.mockReturnValue({
      id: 'admin-id',
      email: 'admin@collector.local',
      role: Role.admin,
    });

    const response = controller.me({
      id: 'admin-id',
      email: 'admin@collector.local',
      role: Role.admin,
    });

    expect(response).toEqual({
      id: 'admin-id',
      email: 'admin@collector.local',
      role: Role.admin,
    });
    expect(authServiceMock.toAuthUserDto).toHaveBeenCalledWith({
      id: 'admin-id',
      email: 'admin@collector.local',
      role: Role.admin,
    });
  });
});
