import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { getReasonPhrase } from 'http-status-codes';

/** Problem Details object, see RFC 9457. Extension members: `errors`. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: unknown;
}

interface NormalizedException {
  status: number;
  message: string;
  errors?: unknown;
}

const PROBLEM_CONTENT_TYPE = 'application/problem+json';
const DEFAULT_ERROR_MESSAGE = 'Whoops! Something went wrong';
const CLIENT_ERROR_MIN = 400;
const SERVER_ERROR_MIN = 500;

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { status, message, errors } = this.normalize(exception);

    this.log(
      exception,
      status,
      message,
      `${httpAdapter.getRequestMethod(request)} ${request.url}`,
    );

    if (response.headersSent) {
      return;
    }

    const problem: ProblemDetails = {
      // "about:blank" means no semantics beyond the HTTP status, so `title`
      // must be the status' reason phrase (RFC 9457, section 4.2.1).
      type: 'about:blank',
      title: this.getReasonPhrase(status),
      status,
      detail: message,
      instance: request.url,
      errors,
    };

    httpAdapter.setHeader(response, 'Content-Type', PROBLEM_CONTENT_TYPE);
    httpAdapter.reply(response, problem, status);
  }

  private normalize(exception: unknown): NormalizedException {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      return {
        status: exception.getStatus(),
        message: exception.message,
        errors:
          typeof response === 'object'
            ? (response as { errors?: unknown }).errors
            : undefined,
      };
    }

    // Errors raised outside Nest (e.g. body-parser: malformed JSON, payload too large)
    // are http-errors, not HttpException, and flag their client errors with `expose`.
    if (this.isExposedHttpError(exception)) {
      return {
        status: exception.statusCode ?? exception.status,
        message: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: DEFAULT_ERROR_MESSAGE,
    };
  }

  private isExposedHttpError(exception: unknown): exception is Error & {
    expose: true;
    statusCode: number;
    status: number;
  } {
    if (!(exception instanceof Error)) {
      return false;
    }

    const { expose, statusCode, status } = exception as {
      expose?: unknown;
      statusCode?: unknown;
      status?: unknown;
    };
    const code = statusCode ?? status;

    return (
      expose === true &&
      typeof code === 'number' &&
      code >= CLIENT_ERROR_MIN &&
      code < SERVER_ERROR_MIN
    );
  }

  private log(
    exception: unknown,
    status: number,
    message: string,
    context: string,
  ): void {
    if (status >= SERVER_ERROR_MIN) {
      // Log the original error, not the sanitized message sent to the client.
      this.logger.error(
        `${context} - ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${context} ${status} - ${message}`);
    }
  }

  private getReasonPhrase(status: number): string {
    try {
      return getReasonPhrase(status);
    } catch {
      // http-status-codes throws for non-standard status codes.
      return 'Error';
    }
  }
}
