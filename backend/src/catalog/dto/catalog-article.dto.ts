import { ApiProperty } from '@nestjs/swagger';

export class CatalogArticleDto {
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

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  createdAt!: Date;
}
