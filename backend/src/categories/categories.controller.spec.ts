import { Role } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { AuditService } from '../audit/audit.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const categoriesServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const loggerMock = {
    setContext: jest.fn(),
    info: jest.fn(),
  };
  const auditServiceMock = {
    record: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CategoriesController(
      categoriesServiceMock as unknown as CategoriesService,
      auditServiceMock as unknown as AuditService,
      loggerMock as unknown as PinoLogger,
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

    await expect(
      controller.create(
        {
          id: 'admin-id',
          email: 'admin@collector.local',
          role: Role.admin,
        },
        { name: 'Figurines' },
      ),
    ).resolves.toEqual(expect.objectContaining({ id: 'category-2' }));
    expect(categoriesServiceMock.create).toHaveBeenCalledWith({
      name: 'Figurines',
    });
    expect(auditServiceMock.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CATEGORY_CREATED',
        resourceId: 'category-2',
      }),
    );
  });

  it('update delegates category update to CategoriesService', async () => {
    categoriesServiceMock.update.mockResolvedValue({
      id: 'category-1',
      name: 'Cartes retro',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    await expect(
      controller.update(
        {
          id: 'admin-id',
          email: 'admin@collector.local',
          role: Role.admin,
        },
        'category-1',
        { name: 'Cartes retro' },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        name: 'Cartes retro',
      }),
    );
    expect(categoriesServiceMock.update).toHaveBeenCalledWith('category-1', {
      name: 'Cartes retro',
    });
    expect(auditServiceMock.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CATEGORY_UPDATED',
        resourceId: 'category-1',
      }),
    );
  });
});
