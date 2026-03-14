import { getStatusCode } from '@/common/helpers/parser';
import { getDefaultValueByCondition } from '@/common/helpers/helper';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const errorStatusCode = getStatusCode(exception);
    const error = exception as any;
    const errorCause = getDefaultValueByCondition(error.cause, error.cause, error.message);

    const responseBody = {
      status: errorStatusCode,
      success: getDefaultValueByCondition(errorStatusCode < 400, true, false),
      message: errorCause,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, errorStatusCode);
  }
}
