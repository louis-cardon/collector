import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prismaMock as never);
  });

  it('findByEmail delegates to prisma.user.findUnique', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await service.findByEmail('seller@collector.local');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'seller@collector.local' },
    });
  });

  it('findById delegates to prisma.user.findUnique', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await service.findById('user-id');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
  });
});
