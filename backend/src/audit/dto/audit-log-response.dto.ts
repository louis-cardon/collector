import { AuditAction, Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: AuditAction })
  action!: AuditAction;

  @ApiPropertyOptional()
  actorId!: string | null;

  @ApiPropertyOptional({ enum: Role })
  actorRole!: Role | null;

  @ApiProperty({ example: 'ARTICLE' })
  resourceType!: string;

  @ApiPropertyOptional()
  resourceId!: string | null;

  @ApiPropertyOptional({ type: Object })
  metadata!: Record<string, unknown> | null;

  @ApiProperty()
  timestamp!: Date;

  @ApiPropertyOptional()
  actorEmail!: string | null;
}
