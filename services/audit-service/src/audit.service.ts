import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action as any,
        actorId: data.actorId,
        actorRole: data.actorRole as any,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadata: data.metadata,
      },
    });
  }

  async findMany(query: ListAuditLogsQueryDto) {
    const where: Prisma.AuditLogWhereInput = {
      action: query.action as any,
      actorId: query.actorId,
      resourceType: query.resourceType,
      resourceId: query.resourceId,
    };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: query.limit,
        include: {
          actor: {
            select: {
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      },
    };
  }
}
