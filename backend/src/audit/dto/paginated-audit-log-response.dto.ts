import { ApiProperty } from '@nestjs/swagger';
import { AuditLogResponseDto } from './audit-log-response.dto';

class AuditLogPaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class PaginatedAuditLogResponseDto {
  @ApiProperty({ type: AuditLogResponseDto, isArray: true })
  items!: AuditLogResponseDto[];

  @ApiProperty({ type: AuditLogPaginationMetaDto })
  meta!: AuditLogPaginationMetaDto;
}
