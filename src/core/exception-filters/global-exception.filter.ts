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

/** Cuerpo de las respuestas de error, según Problem Details (RFC 9457). */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: unknown;
}

/** Datos de una excepción ya reducidos a lo que necesita la respuesta. */
interface NormalizedException {
  status: number;
  message: string;
  errors?: unknown;
}

const PROBLEM_CONTENT_TYPE = 'application/problem+json';
const DEFAULT_ERROR_MESSAGE = 'Whoops! Something went wrong';
const CLIENT_ERROR_MIN = 400;
const SERVER_ERROR_MIN = 500;

/**
 * Filtro global que captura cualquier excepción y responde con
 * `application/problem+json` (RFC 9457).
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * @param httpAdapterHost Acceso al adaptador HTTP, para responder sin
   * depender de Express directamente.
   */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * Registra la excepción y envía la respuesta de error.
   *
   * @param exception Excepción capturada, de cualquier tipo.
   * @param host Contexto de ejecución, del que se obtienen la petición y la
   * respuesta HTTP.
   */
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
      // "about:blank" no aporta semántica más allá del estado HTTP, por lo que
      // `title` debe ser la frase de razón del estado (RFC 9457, sección
      // 4.2.1).
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

  /**
   * Reduce una excepción al estado, mensaje y errores que se envían al cliente.
   *
   * @param exception Excepción capturada.
   * @returns Datos listos para construir la respuesta.
   */
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

    // Los errores generados fuera de Nest (por ejemplo, body-parser: JSON mal
    // formado o cuerpo demasiado grande) son http-errors, no HttpException, y
    // marcan sus errores de cliente con `expose`.
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

  /**
   * Indica si la excepción es un error HTTP de cliente (`expose === true` y
   * estado 4xx) cuyo mensaje se puede mostrar al cliente.
   *
   * @param exception Excepción capturada.
   * @returns `true` si es un error HTTP expuesto.
   */
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

  /**
   * Registra la excepción: como `error` con el stack si el estado es 5xx, y
   * como `warn` en los demás casos.
   *
   * @param exception Excepción original.
   * @param status Código de estado HTTP que se responde.
   * @param message Mensaje que se envía al cliente.
   * @param context Método y URL de la petición.
   */
  private log(
    exception: unknown,
    status: number,
    message: string,
    context: string,
  ): void {
    if (status >= SERVER_ERROR_MIN) {
      // Se registra el error original, no el mensaje sanitizado que se envía
      // al cliente.
      this.logger.error(
        `${context} - ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${context} ${status} - ${message}`);
    }
  }

  /**
   * Obtiene la frase de razón de un código de estado HTTP.
   *
   * @param status Código de estado HTTP.
   * @returns La frase de razón estándar, o `Error` si el código no es estándar.
   */
  private getReasonPhrase(status: number): string {
    try {
      return getReasonPhrase(status);
    } catch {
      // http-status-codes lanza un error para códigos de estado no estándar.
      return 'Error';
    }
  }
}
