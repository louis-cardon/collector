import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CatalogQueryDto {
  @ApiPropertyOptional({ example: 'cm80r2k0r000108jx4dgr8m8n' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string;
}
