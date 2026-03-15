import {
  ArgumentsHost,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { AuditService } from '../../audit/audit.service';
import { AllExceptionsFilter } from './all-exceptions.filter';

function flushAsyncWork(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

function createArgumentsHost(
  request: Record<string, unknown>,
  response: Response,
): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: <T>() => request as T,
      getResponse: <T>() => response as T,
      getNext: <T>() => undefined as T,
    }),
    switchToRpc: () => ({
      getData: <T>() => undefined as T,
      getContext: <T>() => undefined as T,
    }),
    switchToWs: () => ({
      getClient: <T>() => undefined as T,
      getData: <T>() => undefined as T,
      getPattern: <T>() => undefined as T,
    }),
    getType: <TContext extends string = 'http'>() => 'http' as TContext,
    getClass: <T>() => undefined as T,
    getHandler: <T>() => undefined as T,
    getArgs: <T extends unknown[] = unknown[]>() =>
      [request, response] as unknown as T,
    getArgByIndex: <T = unknown>(index: number) =>
      [request, response][index] as T,
  };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: jest.Mocked<Pick<PinoLogger, 'setContext' | 'error' | 'warn'>>;
  let response: jest.Mocked<Pick<Response, 'status' | 'json'>>;
  let auditService: jest.Mocked<Pick<AuditService, 'record'>>;

  beforeEach(() => {
    logger = {
      setContext: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    auditService = {
      record: jest.fn().mockResolvedValue(undefined),
    };
    filter = new AllExceptionsFilter(
      logger as unknown as PinoLogger,
      auditService as unknown as AuditService,
    );
  });

  it('logs unknown exceptions as server errors with stack context', () => {
    const request = {
      id: 'request-id',
      method: 'GET',
      url: '/catalog',
    };
    const host = createArgumentsHost(request, response as unknown as Response);

    filter.catch(new Error('boom'), host);

    const errorCall = logger.error.mock.calls[0];

    expect(errorCall?.[0]).toEqual(
      expect.objectContaining({
        requestId: 'request-id',
        method: 'GET',
        path: '/catalog',
        statusCode: 500,
      }),
    );
    expect((errorCall?.[0] as { err?: unknown }).err).toBeInstanceOf(Error);
    expect(errorCall?.[1]).toBe('Unhandled server error');
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        requestId: 'request-id',
      }),
    );
  });

  it('logs unauthorized exceptions as access denied', async () => {
    const request = {
      id: 'request-id',
      method: 'GET',
      url: '/auth/me',
      user: {
        id: 'user-id',
        role: 'seller',
      },
    };
    const host = createArgumentsHost(request, response as unknown as Response);

    filter.catch(new UnauthorizedException('Invalid token'), host);
    await flushAsyncWork();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-id',
        userId: 'user-id',
        role: 'seller',
        statusCode: 401,
      }),
      'Access denied',
    );
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ACCESS_DENIED',
        resourceType: 'HTTP_ROUTE',
        resourceId: '/auth/me',
      }),
    );
    expect(response.status).toHaveBeenCalledWith(401);
  });

  it('logs client errors without stack traces', () => {
    const request = {
      id: 'request-id',
      method: 'POST',
      url: '/categories',
    };
    const host = createArgumentsHost(request, response as unknown as Response);

    filter.catch(new BadRequestException(['name must not be empty']), host);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-id',
        statusCode: 400,
      }),
      'Request failed',
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['name must not be empty'],
      }),
    );
  });

  it('keeps 401 responses when audit logging throws synchronously', async () => {
    const request = {
      id: 'request-id',
      method: 'GET',
      url: '/auth/me',
    };
    const host = createArgumentsHost(request, response as unknown as Response);
    auditService.record.mockImplementation(() => {
      throw new TypeError('audit unavailable');
    });

    filter.catch(new UnauthorizedException('Invalid token'), host);
    await flushAsyncWork();

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-id',
        path: '/auth/me',
        statusCode: 401,
      }),
      'Failed to persist access denied audit log',
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-id',
        statusCode: 401,
      }),
      'Access denied',
    );
    expect(response.status).toHaveBeenCalledWith(401);
  });
});
