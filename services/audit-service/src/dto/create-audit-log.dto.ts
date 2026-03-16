import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  action!: string;

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
