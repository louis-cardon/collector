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
  const findManyMock = jest.fn();
  const countMock = jest.fn();
  const transactionMock = jest.fn();

  beforeEach(() => {
    createMock.mockReset();
    findManyMock.mockReset();
    countMock.mockReset();
    transactionMock.mockReset();
    service = new AuditService({
      $transaction: transactionMock,
      auditLog: {
        count: countMock,
        create: createMock,
        findMany: findManyMock,
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

  it('returns paginated audit logs ordered by timestamp', async () => {
    const auditTimestamp = new Date('2026-01-02T00:00:00.000Z');

    transactionMock.mockResolvedValue([
      [
        {
          id: 'audit-id',
          action: AuditAction.ITEM_APPROVED,
          actorId: 'admin-id',
          actorRole: Role.admin,
          resourceType: 'ARTICLE',
          resourceId: 'article-id',
          metadata: {
            status: 'APPROVED',
          },
          timestamp: auditTimestamp,
          actor: {
            email: 'admin@collector.local',
          },
        },
      ],
      1,
    ]);

    await expect(
      service.findMany({
        action: AuditAction.ITEM_APPROVED,
        actorId: 'admin-id',
        resourceType: 'ARTICLE',
        resourceId: 'article-id',
        page: 1,
        limit: 20,
      }),
    ).resolves.toEqual({
      items: [
        {
          id: 'audit-id',
          action: AuditAction.ITEM_APPROVED,
          actorId: 'admin-id',
          actorRole: Role.admin,
          resourceType: 'ARTICLE',
          resourceId: 'article-id',
          metadata: {
            status: 'APPROVED',
          },
          timestamp: auditTimestamp,
          actorEmail: 'admin@collector.local',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          action: AuditAction.ITEM_APPROVED,
          actorId: 'admin-id',
          resourceType: 'ARTICLE',
          resourceId: 'article-id',
        },
        skip: 0,
        take: 20,
      }),
    );
    expect(countMock).toHaveBeenCalledWith({
      where: {
        action: AuditAction.ITEM_APPROVED,
        actorId: 'admin-id',
        resourceType: 'ARTICLE',
        resourceId: 'article-id',
      },
    });
  });
});
