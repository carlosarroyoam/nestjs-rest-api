import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { getReasonPhrase } from 'http-status-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const httpMessage =
      exception instanceof HttpException
        ? exception.message
        : 'El servidor encontró una condición inesperada que le impide completar la petición';

    const reasonPhrase = getReasonPhrase(httpStatusCode);

    const errorDetails = this.getExceptionDetails(exception);

    const responseBody = {
      message: httpMessage,
      details: errorDetails,
      error: reasonPhrase,
      status: httpStatusCode,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatusCode);
  }

  getExceptionDetails(exception: unknown) {
    const originalResponse = this.getOriginalResponse(exception);

    if (originalResponse?.details) {
      return originalResponse.details;
    }

    return undefined;
  }

  getOriginalResponse(exception: unknown) {
    if (exception instanceof HttpException) {
      return exception.getResponse() as {
        statusCode?: number;
        message?: string;
        details?: object;
        error?: string;
      };
    }

    return undefined;
  }
}
