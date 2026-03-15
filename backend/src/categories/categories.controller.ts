import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuditAction, Role } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auditService: AuditService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CategoriesController.name);
  }

  @Get()
  @ApiOperation({ summary: 'List available categories' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  findAll(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category (admin only)' })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiConflictResponse({ description: 'Category name already exists' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(createCategoryDto);

    await this.auditService.record({
      action: AuditAction.CATEGORY_CREATED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'CATEGORY',
      resourceId: category.id,
      metadata: {
        name: category.name,
      },
    });

    this.logger.info(
      {
        event: 'admin.category.created',
        categoryId: category.id,
        userId: user.id,
        role: user.role,
      },
      'Admin created category',
    );

    return category;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category name (admin only)' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiConflictResponse({ description: 'Category name already exists' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(id, updateCategoryDto);

    await this.auditService.record({
      action: AuditAction.CATEGORY_UPDATED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'CATEGORY',
      resourceId: category.id,
      metadata: {
        name: category.name,
      },
    });

    this.logger.info(
      {
        event: 'admin.category.updated',
        categoryId: category.id,
        userId: user.id,
        role: user.role,
      },
      'Admin updated category',
    );

    return category;
  }
}
