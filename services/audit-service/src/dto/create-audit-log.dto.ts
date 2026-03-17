import { AuditAction } from "@prisma/client";
import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";

export class CreateAuditLogDto {
  @IsEnum(AuditAction)
  action!: AuditAction;

  @IsOptional()
  @IsString()
  actorId?: string;

  @IsOptional()
  @IsString()
  actorRole?: string;

  @IsString()
  resourceType!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
