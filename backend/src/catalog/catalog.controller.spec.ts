import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

describe('CatalogController', () => {
  let controller: CatalogController;

  const catalogServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CatalogController(
      catalogServiceMock as unknown as CatalogService,
    );
  });

  it('findAll delegates listing with optional category filter', async () => {
    catalogServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll({ categoryId: 'category-1' });

    expect(catalogServiceMock.findAll).toHaveBeenCalledWith('category-1');
  });

  it('findOne delegates lookup by id', async () => {
    catalogServiceMock.findOne.mockResolvedValue({
      id: 'article-1',
      title: 'Carte approuvee',
      description: 'Visible publiquement',
      price: '10.00',
      shippingCost: '2.00',
      categoryId: 'category-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(controller.findOne('article-1')).resolves.toEqual(
      expect.objectContaining({
        id: 'article-1',
      }),
    );
    expect(catalogServiceMock.findOne).toHaveBeenCalledWith('article-1');
  });
});
