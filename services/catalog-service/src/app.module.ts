import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { AuditClientService } from "./audit/audit-client.service";
import { CatalogService } from "./catalog/catalog.service";
import { InternalCategoriesController } from "./catalog/internal-categories.controller";
import { PublicCatalogController } from "./catalog/public-catalog.controller";
import { HealthController } from "./health.controller";
import { InternalAuthGuard } from "./internal/internal-auth.guard";
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
  controllers: [
    PublicCatalogController,
    InternalCategoriesController,
    HealthController,
  ],
  providers: [
    CatalogService,
    PrismaService,
    InternalAuthGuard,
    AuditClientService,
  ],
})
export class AppModule {}
