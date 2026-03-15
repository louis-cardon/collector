import { AuditAction, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';

type AuditCreateArgs = {
  data: {
    action: AuditAction.ITEM_APPROVED;
    actorId: string;
    actorRole: Role.admin;
    resourceType: 'ARTICLE';
    resourceId: string;
    metadata: {
      status: string;
    };
    timestamp: Date;
  };
};

describe('AuditService', () => {
  let service: AuditService;
  const createMock = jest.fn<Promise<{ id: string }>, [AuditCreateArgs]>();

  beforeEach(() => {
    createMock.mockReset();
    service = new AuditService({
      auditLog: {
        create: createMock,
      },
    } as unknown as PrismaService);
  });

  it('persists audit entries with metadata and timestamp fallback', async () => {
    createMock.mockResolvedValue({ id: 'audit-id' });

    await service.record({
      action: AuditAction.ITEM_APPROVED,
      actorId: 'admin-id',
      actorRole: Role.admin,
      resourceType: 'ARTICLE',
      resourceId: 'article-id',
      metadata: {
        status: 'APPROVED',
      },
    });

    const createCall = createMock.mock.calls[0]?.[0] as {
      data: {
        action: AuditAction.ITEM_APPROVED;
        actorId: 'admin-id';
        actorRole: Role.admin;
        resourceType: 'ARTICLE';
        resourceId: 'article-id';
        metadata: {
          status: string;
        };
        timestamp: Date;
      };
    };

    expect(createCall.data).toMatchObject({
      action: AuditAction.ITEM_APPROVED,
      actorId: 'admin-id',
      actorRole: Role.admin,
      resourceType: 'ARTICLE',
      resourceId: 'article-id',
      metadata: {
        status: 'APPROVED',
      },
    });
    expect(createCall.data.timestamp).toBeInstanceOf(Date);
  });
});
