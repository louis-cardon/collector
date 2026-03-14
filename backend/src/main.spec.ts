import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { bootstrap, isAllowedOrigin } from './main';

type CorsOriginCallback = (error: Error | null, allow?: boolean) => void;
type CorsOptionsConfig = {
  origin: (origin: string | undefined, callback: CorsOriginCallback) => void;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  optionsSuccessStatus: number;
};

describe('main bootstrap', () => {
  const originalPort = process.env.PORT;
  const originalCorsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;

  afterEach(() => {
    process.env.PORT = originalPort;
    process.env.CORS_ALLOWED_ORIGINS = originalCorsAllowedOrigins;
    jest.restoreAllMocks();
  });

  it('allows expected origins and blocks unknown origins', () => {
    expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
    expect(
      isAllowedOrigin('https://collector-frontend-zeta.vercel.app'),
    ).toBe(true);
    expect(isAllowedOrigin('https://owner-repo-3000.app.github.dev')).toBe(
      true,
    );
    expect(
      isAllowedOrigin('https://owner-repo-3001.preview.app.github.dev'),
    ).toBe(true);
    expect(isAllowedOrigin('https://evil.example.com')).toBe(false);
  });

  it('allows origins configured through environment variables', () => {
    process.env.CORS_ALLOWED_ORIGINS =
      'https://staging.collector.shop, https://collector.shop';

    expect(isAllowedOrigin('https://staging.collector.shop')).toBe(true);
    expect(isAllowedOrigin('https://collector.shop')).toBe(true);
  });

  it('configures CORS, Swagger, validation pipe and listens on configured port', async () => {
    process.env.PORT = '3456';

    const mockLogger = {
      log: jest.fn(),
    } as unknown as Logger;
    const mockApp = {
      enableCors: jest.fn(),
      useLogger: jest.fn(),
      useGlobalPipes: jest.fn(),
      get: jest.fn().mockReturnValue(mockLogger),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    const createSpy = jest
      .spyOn(NestFactory, 'create')
      .mockResolvedValue(mockApp as never);
    const createDocumentSpy = jest
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({} as never);
    const setupSpy = jest
      .spyOn(SwaggerModule, 'setup')
      .mockImplementation(() => undefined);

    await bootstrap();

    expect(createSpy).toHaveBeenCalledWith(AppModule, { bufferLogs: true });
    expect(mockApp.useLogger).toHaveBeenCalledWith(mockLogger);
    expect(mockApp.get).toHaveBeenCalledWith(Logger);
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(createDocumentSpy).toHaveBeenCalledTimes(1);
    expect(setupSpy).toHaveBeenCalledWith('docs', mockApp, {});
    expect(mockApp.listen).toHaveBeenCalledWith('3456', '0.0.0.0');
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Collector API listening on 0.0.0.0:3456',
    );

    const firstEnableCorsCall = mockApp.enableCors.mock.calls[0] as unknown as [
      CorsOptionsConfig,
    ];
    const corsConfig = firstEnableCorsCall[0];
    const originCallback = corsConfig.origin;

    const allowWithoutOrigin = jest.fn<void, [Error | null, boolean?]>();
    originCallback(undefined, allowWithoutOrigin);
    expect(allowWithoutOrigin).toHaveBeenCalledWith(null, true);

    const allowKnownOrigin = jest.fn<void, [Error | null, boolean?]>();
    originCallback('http://localhost:3001', allowKnownOrigin);
    expect(allowKnownOrigin).toHaveBeenCalledWith(null, true);

    const denyUnknownOrigin = jest.fn<void, [Error | null, boolean?]>();
    originCallback('https://forbidden.origin', denyUnknownOrigin);
    const deniedArgs = denyUnknownOrigin.mock.calls[0] as [Error, boolean];
    expect(deniedArgs[0].message).toBe('Origin not allowed by CORS');
    expect(deniedArgs[1]).toBe(false);

    expect(corsConfig.methods).toEqual([
      'OPTIONS',
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
    ]);
    expect(corsConfig.allowedHeaders).toEqual([
      'Content-Type',
      'Authorization',
      'Accept',
    ]);
    expect(corsConfig.credentials).toBe(false);
    expect(corsConfig.optionsSuccessStatus).toBe(204);
  });
});
