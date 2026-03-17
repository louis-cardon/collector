import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { ArticlesService } from "./articles/articles.service";
import { InternalArticlesController } from "./articles/internal-articles.controller";
import { AuditClientService } from "./audit/audit-client.service";
import { HealthController } from "./health.controller";
import { InternalAuthGuard } from "./internal/internal-auth.guard";
import { NotificationsClientService } from "./notifications/notifications-client.service";
import { PrismaService } from "./prisma/prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info",
      },
    }),
  ],
  controllers: [InternalArticlesController, HealthController],
  providers: [
    ArticlesService,
    PrismaService,
    InternalAuthGuard,
    AuditClientService,
    NotificationsClientService,
  ],
})
export class AppModule {}
