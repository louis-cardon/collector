import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CategoriesModule } from './categories/categories.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

export function resolveRequestId(
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

export function serializeRequest(req: IncomingMessage) {
  const request = req as IncomingMessage & {
    id?: string;
  };

  return {
    id: request.id,
    method: request.method,
    url: request.url,
  };
}

export function serializeResponse(res: ServerResponse) {
  return {
    statusCode: res.statusCode,
  };
}

export function createPinoHttpConfig() {
  return {
    level: process.env.LOG_LEVEL ?? 'info',
    genReqId: resolveRequestId,
    customProps: (req: IncomingMessage) => {
      const request = req as {
        id?: string;
        user?: {
          id: string;
          role: string;
        };
      };

      return {
        requestId: request.id,
        userId: request.user?.id,
        role: request.user?.role,
      };
    },
    customLogLevel: (
      _req: IncomingMessage,
      res: ServerResponse,
      error?: Error,
    ) => {
      if (error || res.statusCode >= 500) {
        return 'error';
      }

      if (res.statusCode >= 400) {
        return 'warn';
      }

      return 'info';
    },
    customSuccessMessage: () => 'request completed',
    customErrorMessage: () => 'request failed',
    serializers: {
      req: serializeRequest,
      res: serializeResponse,
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.accessToken',
        'req.body.token',
        'res.headers["set-cookie"]',
      ],
      censor: '[REDACTED]',
    },
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
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    LoggerModule.forRoot({
      pinoHttp: createPinoHttpConfig(),
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ArticlesModule,
    AdminModule,
    CatalogModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
