import { AuditAction, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AdminAuditController } from './admin-audit.controller';

describe('AdminAuditController', () => {
  let controller: AdminAuditController;

  const auditServiceMock: jest.Mocked<Pick<AuditService, 'findMany'>> = {
    findMany: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminAuditController(
      auditServiceMock as unknown as AuditService,
    );
  });

  it('delegates paginated log listing to AuditService', async () => {
    auditServiceMock.findMany.mockResolvedValue({
      items: [
        {
          id: 'audit-1',
          action: AuditAction.ITEM_APPROVED,
          actorId: 'admin-id',
          actorRole: Role.admin,
          resourceType: 'ARTICLE',
          resourceId: 'article-id',
          metadata: {
            sellerId: 'seller-id',
          },
          timestamp: new Date('2026-01-01T00:00:00.000Z'),
          actorEmail: 'admin@collector.local',
        },
      ],
      meta: {
        page: 2,
        limit: 10,
        total: 11,
        totalPages: 2,
      },
    });

    const result = await controller.findMany({
      action: AuditAction.ITEM_APPROVED,
      actorId: 'admin-id',
      resourceType: 'ARTICLE',
      resourceId: 'article-id',
      page: 2,
      limit: 10,
    });

    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
    });

    expect(auditServiceMock.findMany).toHaveBeenCalledWith({
      action: AuditAction.ITEM_APPROVED,
      actorId: 'admin-id',
      resourceType: 'ARTICLE',
      resourceId: 'article-id',
      page: 2,
      limit: 10,
    });
  });
});
