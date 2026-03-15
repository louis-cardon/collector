import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { ListAuditLogsQueryDto } from '../audit/dto/list-audit-logs-query.dto';
import { PaginatedAuditLogResponseDto } from '../audit/dto/paginated-audit-log-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('admin-audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller('admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs (admin only)' })
  @ApiOkResponse({ type: PaginatedAuditLogResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  findMany(
    @Query() query: ListAuditLogsQueryDto,
  ): Promise<PaginatedAuditLogResponseDto> {
    return this.auditService.findMany({
      action: query.action,
      actorId: query.actorId,
      resourceType: query.resourceType,
      resourceId: query.resourceId,
      page: query.page,
      limit: query.limit,
    });
  }
}
