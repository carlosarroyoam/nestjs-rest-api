import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from '@/core/exception-filters/global-exception.filter';

@Module({
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class CoreModule {}
