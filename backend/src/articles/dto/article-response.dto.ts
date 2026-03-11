import { ArticleStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ArticleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Carte Pokémon Dracaufeu' })
  title!: string;

  @ApiProperty({ example: 'Carte en très bon état, édition limitée.' })
  description!: string;

  @ApiProperty({ example: '129.90' })
  price!: string;

  @ApiProperty({ example: '5.50' })
  shippingCost!: string;

  @ApiProperty({ enum: ArticleStatus, example: ArticleStatus.PENDING_REVIEW })
  status!: ArticleStatus;

  @ApiProperty()
  sellerId!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiPropertyOptional()
  reviewedAt!: Date | null;

  @ApiPropertyOptional()
  reviewedBy!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
