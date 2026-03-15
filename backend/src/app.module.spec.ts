import { IncomingMessage, ServerResponse } from 'node:http';
import {
  createPinoHttpConfig,
  resolveRequestId,
  serializeRequest,
  serializeResponse,
} from './app.module';

describe('app module pino config', () => {
  afterEach(() => {
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
  });

  it('reuses x-request-id header when present', () => {
    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as ServerResponse;

    const request = {
      headers: {
        'x-request-id': 'existing-request-id',
      },
    } as unknown as IncomingMessage;

    expect(resolveRequestId(request, response)).toBe('existing-request-id');
    expect(setHeader).toHaveBeenCalledWith(
      'x-request-id',
      'existing-request-id',
    );
  });

  it('generates a request id when missing', () => {
    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as ServerResponse;
    const request = {
      headers: {},
    } as unknown as IncomingMessage;

    const requestId = resolveRequestId(request, response);

    expect(requestId).toEqual(expect.any(String));
    expect(requestId.length).toBeGreaterThan(10);
    expect(setHeader).toHaveBeenCalledWith('x-request-id', requestId);
  });

  it('serializes request and response with concise fields only', () => {
    const request = {
      id: 'request-id',
      method: 'GET',
      url: '/catalog',
    } as IncomingMessage & { id: string };
    const response = {
      statusCode: 200,
    } as ServerResponse;

    expect(serializeRequest(request)).toEqual({
      id: 'request-id',
      method: 'GET',
      url: '/catalog',
    });
    expect(serializeResponse(response)).toEqual({
      statusCode: 200,
    });
  });

  it('creates pino config with request context and expected log levels', () => {
    process.env.LOG_LEVEL = 'debug';
    process.env.NODE_ENV = 'test';
    const config = createPinoHttpConfig();
    const request = {
      id: 'request-id',
      user: {
        id: 'user-id',
        role: 'admin',
      },
    } as IncomingMessage & {
      id: string;
      user: {
        id: string;
        role: string;
      };
    };

    expect(config.level).toBe('debug');
    expect(config.customProps(request)).toEqual({
      requestId: 'request-id',
      userId: 'user-id',
      role: 'admin',
    });
    expect(
      config.customLogLevel(
        request,
        { statusCode: 503 } as ServerResponse,
        undefined,
      ),
    ).toBe('error');
    expect(
      config.customLogLevel(
        request,
        { statusCode: 401 } as ServerResponse,
        undefined,
      ),
    ).toBe('warn');
    expect(
      config.customLogLevel(
        request,
        { statusCode: 200 } as ServerResponse,
        undefined,
      ),
    ).toBe('info');
    expect(config.transport).toEqual(
      expect.objectContaining({
        target: 'pino-pretty',
      }),
    );
    expect(config.redact.paths).toContain('req.headers.authorization');
  });

  it('omits pretty transport in production', () => {
    process.env.NODE_ENV = 'production';

    expect(createPinoHttpConfig().transport).toBeUndefined();
  });
});
