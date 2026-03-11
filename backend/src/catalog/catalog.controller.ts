import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogArticleDto } from './dto/catalog-article.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List public catalog articles (APPROVED only)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiOkResponse({ type: CatalogArticleDto, isArray: true })
  findAll(@Query() query: CatalogQueryDto): Promise<CatalogArticleDto[]> {
    return this.catalogService.findAll(query.categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a public catalog article by id (APPROVED only)',
  })
  @ApiOkResponse({ type: CatalogArticleDto })
  @ApiNotFoundResponse({ description: 'Catalog article not found' })
  findOne(@Param('id') id: string): Promise<CatalogArticleDto> {
    return this.catalogService.findOne(id);
  }
}
