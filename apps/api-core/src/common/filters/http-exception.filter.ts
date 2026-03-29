import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
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

// Prisma error codes that indicate a pending migration rather than a code bug.
// P2021 — The table `{table}` does not exist in the current database.
// P2022 — The column `{column}` does not exist in the current database.
function isPrismaMissingTableError(exception: unknown): boolean {
  if (!(exception instanceof Error)) return false;
  // Prisma wraps errors; the code is available as .code on PrismaClientKnownRequestError
  const code = (exception as { code?: string }).code;
  if (code === 'P2021' || code === 'P2022') return true;
  // Fallback: detect by message text in case the Prisma client version differs.
  return (
    exception.message.includes('does not exist in the current database') ||
    exception.message.includes('Invalid `prisma.')
  );
}

function getStatusCode(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }

  if (exception instanceof Error && exception.message === 'Tenant ownership assertion failed') {
    return HttpStatus.FORBIDDEN;
  }

  if (isPrismaMissingTableError(exception)) {
    // Return 503 so load balancers / health checks detect the deployment issue
    // without leaking raw schema details to the caller.
    return HttpStatus.SERVICE_UNAVAILABLE;
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function sanitizePrismaMessage(exception: unknown): string {
  // Replace raw Prisma error detail with a product-facing service message.
  if (isPrismaMissingTableError(exception)) {
    return 'This service is temporarily unavailable. Please try again shortly.';
  }
  return '';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpReplyLike>();
    const request = ctx.getRequest<HttpRequestLike>();
    const statusCode = getStatusCode(exception);

    if (isPrismaMissingTableError(exception)) {
      this.logger.error(
        `Pending migration or missing database object for request '${request.url ?? 'unknown'}': ${
          exception instanceof Error ? exception.message : 'unknown error'
        }`,
      );
    }

    // Override the message for missing-table Prisma errors so callers get a
    // product-safe message while operators still have the server logs.
    const prismaMessage = sanitizePrismaMessage(exception);
    const { message, error } = prismaMessage
      ? { message: prismaMessage, error: 'MigrationRequired' }
      : getExceptionMessage(exception);

    response.status(statusCode).send({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url ?? '',
    });
  }
}
