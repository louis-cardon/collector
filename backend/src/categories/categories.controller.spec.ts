import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const categoriesServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CategoriesController(
      categoriesServiceMock as unknown as CategoriesService,
    );
  });

  it('findAll delegates listing to CategoriesService', async () => {
    categoriesServiceMock.findAll.mockResolvedValue([
      {
        id: 'category-1',
        name: 'Cartes',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    await expect(controller.findAll()).resolves.toEqual([
      expect.objectContaining({
        id: 'category-1',
        name: 'Cartes',
      }),
    ]);
  });

  it('create delegates creation to CategoriesService', async () => {
    categoriesServiceMock.create.mockResolvedValue({
      id: 'category-2',
      name: 'Figurines',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(controller.create({ name: 'Figurines' })).resolves.toEqual(
      expect.objectContaining({
        id: 'category-2',
      }),
    );
    expect(categoriesServiceMock.create).toHaveBeenCalledWith({
      name: 'Figurines',
    });
  });

  it('update delegates category update to CategoriesService', async () => {
    categoriesServiceMock.update.mockResolvedValue({
      id: 'category-1',
      name: 'Cartes retro',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    await expect(
      controller.update('category-1', { name: 'Cartes retro' }),
    ).resolves.toEqual(
      expect.objectContaining({
        name: 'Cartes retro',
      }),
    );
    expect(categoriesServiceMock.update).toHaveBeenCalledWith('category-1', {
      name: 'Cartes retro',
    });
  });
});
