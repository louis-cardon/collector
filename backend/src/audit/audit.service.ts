import { Injectable } from '@nestjs/common';
import { AuditLog, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditRecordInput, ListAuditLogsInput } from './audit.types';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';
import { PaginatedAuditLogResponseDto } from './dto/paginated-audit-log-response.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(input: AuditRecordInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId,
        actorRole: input.actorRole,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata,
        timestamp: input.timestamp ?? new Date(),
      },
    });
  }

  async findMany(
    input: ListAuditLogsInput,
  ): Promise<PaginatedAuditLogResponseDto> {
    const where: Prisma.AuditLogWhereInput = {
      action: input.action,
      actorId: input.actorId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
    };
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: input.limit,
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
      items: items.map((item) => this.toResponseDto(item)),
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / input.limit),
      },
    };
  }

  private toResponseDto(
    log: AuditLog & {
      actor?: {
        email: string;
      } | null;
    },
  ): AuditLogResponseDto {
    return {
      id: log.id,
      action: log.action,
      actorId: log.actorId,
      actorRole: log.actorRole,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata:
        log.metadata && typeof log.metadata === 'object'
          ? (log.metadata as Record<string, unknown>)
          : null,
      timestamp: log.timestamp,
      actorEmail: log.actor?.email ?? null,
    };
  }
}
