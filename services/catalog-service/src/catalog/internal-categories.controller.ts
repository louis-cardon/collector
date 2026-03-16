import { Body, Controller, Headers, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuditClientService } from '../audit/audit-client.service';
import { InternalAuthGuard } from '../internal/internal-auth.guard';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('internal/categories')
@UseGuards(InternalAuthGuard)
export class InternalCategoriesController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly auditClient: AuditClientService,
  ) {}

  @Post()
  async create(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Body() body: CreateCategoryDto,
  ) {
    const category = await this.catalogService.createCategory(body.name);

    await this.auditClient.record({
      action: 'CATEGORY_CREATED',
      actorId: userId,
      actorRole: userRole,
      resourceType: 'CATEGORY',
      resourceId: category.id,
      metadata: {
        name: category.name,
      },
    });

    return category;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Body() body: UpdateCategoryDto,
  ) {
    const category = await this.catalogService.updateCategory(id, body.name);

    await this.auditClient.record({
      action: 'CATEGORY_UPDATED',
      actorId: userId,
      actorRole: userRole,
      resourceType: 'CATEGORY',
      resourceId: category.id,
      metadata: {
        name: category.name,
      },
    });

    return category;
  }
}
