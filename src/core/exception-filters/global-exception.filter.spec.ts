import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { GlobalExceptionFilter } from '@/core/exception-filters/global-exception.filter';

describe('GlobalExceptionFilter', () => {
  const httpAdapter = {
    getRequestMethod: jest.fn(),
    setHeader: jest.fn(),
    reply: jest.fn(),
  };

  let filter: GlobalExceptionFilter;
  let response: { headersSent: boolean };
  let host: ArgumentsHost;
  let errorLog: jest.SpyInstance;
  let warnLog: jest.SpyInstance;

  const lastReply = (): { body: Record<string, unknown>; status: number } => {
    const [, body, status] = httpAdapter.reply.mock.calls[0] as [
      unknown,
      Record<string, unknown>,
      number,
    ];

    return { body, status };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    httpAdapter.getRequestMethod.mockReturnValue('GET');

    response = { headersSent: false };
    host = {
      switchToHttp: () => ({
        getRequest: (): { url: string } => ({ url: '/api/v1/users?page=2' }),
        getResponse: (): { headersSent: boolean } => response,
      }),
    } as unknown as ArgumentsHost;

    errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    warnLog = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    filter = new GlobalExceptionFilter({
      httpAdapter,
    } as unknown as HttpAdapterHost);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should reply with an RFC 9457 problem details body', () => {
    const errors = [{ property: 'email', message: 'email must be an email' }];

    filter.catch(
      new BadRequestException({ message: 'Error de validación', errors }),
      host,
    );

    const { body, status } = lastReply();
    expect(status).toBe(400);
    expect(body).toEqual({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'Error de validación',
      instance: '/api/v1/users?page=2',
      errors,
    });
    expect(httpAdapter.setHeader).toHaveBeenCalledWith(
      response,
      'Content-Type',
      'application/problem+json',
    );
    expect(warnLog).toHaveBeenCalledTimes(1);
    expect(errorLog).not.toHaveBeenCalled();
  });

  it('should handle HttpException with a string response', () => {
    filter.catch(new HttpException('Nope', 403), host);

    const { body, status } = lastReply();
    expect(status).toBe(403);
    expect(body.detail).toBe('Nope');
    expect(body.errors).toBeUndefined();
  });

  it('should hide the message of unknown errors and log the stack', () => {
    const error = new Error('db password is hunter2');

    filter.catch(error, host);

    const { body, status } = lastReply();
    expect(status).toBe(500);
    expect(body.detail).toBe('Whoops! Something went wrong');
    expect(errorLog).toHaveBeenCalledWith(
      expect.stringContaining('db password is hunter2'),
      error.stack,
    );
  });

  it('should keep the status of exposed http-errors (e.g. malformed JSON)', () => {
    const error = Object.assign(new SyntaxError('Unexpected token b'), {
      expose: true,
      statusCode: 400,
      status: 400,
    });

    filter.catch(error, host);

    const { body, status } = lastReply();
    expect(status).toBe(400);
    expect(body.detail).toBe('Unexpected token b');
    expect(errorLog).not.toHaveBeenCalled();
  });

  it('should not trust a status property on errors that are not exposed', () => {
    const error = Object.assign(new Error('upstream not found'), {
      status: 404,
    });

    filter.catch(error, host);

    expect(lastReply().status).toBe(500);
  });

  it('should not throw with a non-standard status code', () => {
    expect(() =>
      filter.catch(new HttpException('Odd', 499), host),
    ).not.toThrow();

    const { body, status } = lastReply();
    expect(status).toBe(499);
    expect(body.title).toBe('Error');
  });

  it('should log 5xx HttpExceptions as errors', () => {
    filter.catch(new HttpException('Bad gateway', 502), host);

    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(warnLog).not.toHaveBeenCalled();
  });

  it('should not reply when the headers were already sent', () => {
    response.headersSent = true;

    filter.catch(new BadRequestException(), host);

    expect(httpAdapter.reply).not.toHaveBeenCalled();
  });
});
