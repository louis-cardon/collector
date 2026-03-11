import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { AdminArticlesController } from './admin-articles.controller';

@Module({
  imports: [ArticlesModule],
  controllers: [AdminArticlesController],
})
export class AdminModule {}
