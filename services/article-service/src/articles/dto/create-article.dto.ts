import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(140)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  shippingCost!: number;

  @IsString()
  @MinLength(1)
  categoryId!: string;
}
