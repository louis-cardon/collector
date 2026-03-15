import { Injectable } from '@nestjs/common';
import { AuditLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditRecordInput } from './audit.types';

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
}
