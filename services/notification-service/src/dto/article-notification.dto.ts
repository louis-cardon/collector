import { IsString } from 'class-validator';

export class ArticleNotificationDto {
  @IsString()
  articleId!: string;

  @IsString()
  title!: string;

  @IsString()
  sellerId!: string;
}
