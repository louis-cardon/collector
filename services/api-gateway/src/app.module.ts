import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ProxyModule } from './proxy/proxy.module';
import { GatewayArticleController } from './routes/article.controller';
import { GatewayAuditController } from './routes/audit.controller';
import { GatewayAuthController } from './routes/auth.controller';
import { GatewayCatalogController } from './routes/catalog.controller';
import { HealthController } from './routes/health.controller';

function resolveRequestId(
  req: IncomingMessage,
  res: ServerResponse,
): string {
  const headers = req.headers as Record<string, string | string[] | undefined>;
  const headerValue = headers['x-request-id'];
  const requestId = Array.isArray(headerValue)
    ? headerValue[0]
    : headerValue || randomUUID();

  res.setHeader('x-request-id', requestId);
  return requestId;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        genReqId: resolveRequestId,
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
      },
    }),
    AuthModule,
    ProxyModule,
  ],
  controllers: [
    GatewayAuthController,
    GatewayCatalogController,
    GatewayArticleController,
    GatewayAuditController,
    HealthController,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
