import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';
import { InternalAuthGuard } from './internal/internal-auth.guard';

@Controller('internal/audit-logs')
@UseGuards(InternalAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  create(@Body() body: CreateAuditLogDto) {
    return this.auditService.create(body);
  }

  @Get()
  findMany(@Query() query: ListAuditLogsQueryDto) {
    return this.auditService.findMany(query);
  }
}
