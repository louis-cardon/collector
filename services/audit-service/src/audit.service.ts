import { Injectable } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { ListAuditLogsQueryDto } from "./dto/list-audit-logs-query.dto";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        actorId: data.actorId,
        actorRole: this.mapActorRole(data.actorRole),
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findMany(query: ListAuditLogsQueryDto) {
    const where: Prisma.AuditLogWhereInput = {
      action: query.action,
      actorId: query.actorId,
      resourceType: query.resourceType,
      resourceId: query.resourceId,
    };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: "desc",
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

  private mapActorRole(role?: string): Role | undefined {
    if (role === "admin" || role === "seller") {
      return role;
    }

    return undefined;
  }
}
