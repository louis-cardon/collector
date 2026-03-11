import { ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const prismaMock = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(prismaMock as never);
  });

  it('creates a category', async () => {
    prismaMock.category.create.mockResolvedValue({
      id: 'category-id',
      name: 'Cartes',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(service.create({ name: ' Cartes ' })).resolves.toEqual(
      expect.objectContaining({
        id: 'category-id',
        name: 'Cartes',
      }),
    );

    expect(prismaMock.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Cartes',
      },
    });
  });

  it('throws ConflictException when category name already exists', async () => {
    prismaMock.category.create.mockRejectedValue({ code: 'P2002' });

    await expect(service.create({ name: 'Cartes' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('lists categories ordered by name', async () => {
    prismaMock.category.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });
});
