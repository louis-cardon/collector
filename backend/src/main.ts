import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

export const ALLOWED_EXACT_ORIGINS = new Set<string>([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]);

export const ALLOWED_GITHUB_DEV_ORIGIN_PATTERNS = [
  /^https:\/\/.+-(3000|3001)\.app\.github\.dev$/,
  /^https:\/\/.+-(3000|3001)\.preview\.app\.github\.dev$/,
];

export function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_EXACT_ORIGINS.has(origin)) {
    return true;
  }

  return ALLOWED_GITHUB_DEV_ORIGIN_PATTERNS.some((pattern) =>
    pattern.test(origin),
  );
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'), false);
    },
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
    optionsSuccessStatus: 204,
  });

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Collector API')
    .setDescription('Collector.shop prototype API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3001);
}

if (process.env.NODE_ENV !== 'test') {
  void bootstrap();
}
