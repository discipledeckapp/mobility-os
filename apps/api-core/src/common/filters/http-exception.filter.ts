import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface HttpRequestLike {
  url?: string;
}

interface HttpReplyLike {
  status(code: number): {
    send(body: {
      statusCode: number;
      message: string | string[];
      error: string;
      timestamp: string;
      path: string;
    }): void;
  };
}

function getExceptionMessage(exception: unknown): { message: string | string[]; error: string } {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        message: response,
        error: exception.name,
      };
    }

    if (response && typeof response === 'object') {
      const responseRecord = response as {
        message?: string | string[];
        error?: string;
      };

      return {
        message: responseRecord.message ?? exception.message ?? 'Request failed.',
        error: responseRecord.error ?? exception.name,
      };
    }
  }

  if (exception instanceof Error) {
    return {
      message: exception.message || 'Internal server error',
      error: exception.name || 'InternalServerError',
    };
  }

  return {
    message: 'Internal server error',
    error: 'InternalServerError',
  };
}

function getStatusCode(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }

  if (exception instanceof Error && exception.message === 'Tenant ownership assertion failed') {
    return HttpStatus.FORBIDDEN;
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpReplyLike>();
    const request = ctx.getRequest<HttpRequestLike>();
    const statusCode = getStatusCode(exception);
    const { message, error } = getExceptionMessage(exception);

    response.status(statusCode).send({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url ?? '',
    });
  }
}
