import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

type RequestWithContext = Request & {
  id?: string;
  user?: AuthenticatedUser;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithContext>();
    const response = context.getResponse<Response>();
    const statusCode = this.getStatusCode(exception);
    const message = this.getMessage(exception);
    const logContext = {
      requestId: request.id,
      method: request.method,
      path: request.url,
      statusCode,
      userId: request.user?.id,
      role: request.user?.role,
    };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          ...logContext,
          err: exception instanceof Error ? exception : undefined,
        },
        'Unhandled server error',
      );
    } else if (
      statusCode === HttpStatus.UNAUTHORIZED ||
      statusCode === HttpStatus.FORBIDDEN
    ) {
      this.logger.warn(logContext, 'Access denied');
    } else {
      this.logger.warn(logContext, 'Request failed');
    }

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
      requestId: request.id,
      timestamp: new Date().toISOString(),
    });
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string | string[] {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      return (response as { message: string | string[] }).message;
    }

    return exception.message;
  }
}
