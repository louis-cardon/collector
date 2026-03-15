import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ArticlesModule } from '../articles/articles.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminArticlesController } from './admin-articles.controller';

@Module({
  imports: [ArticlesModule, AuditModule, NotificationsModule],
  controllers: [AdminArticlesController],
})
export class AdminModule {}
