import { AuditAction, Prisma, Role } from '@prisma/client';

export type AuditRecordInput = {
  action: AuditAction;
  actorId?: string;
  actorRole?: Role;
  resourceType: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
  timestamp?: Date;
};
