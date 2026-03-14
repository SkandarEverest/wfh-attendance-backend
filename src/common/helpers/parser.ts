import { HttpException } from '@nestjs/common';
import { getDefaultValueByCondition } from '@/common/helpers/helper';

export const getStatusCode = (error: any): number => {
  let errorStatusCode: number = 500;

  if (error instanceof HttpException) {
    errorStatusCode = error.getStatus();
  }

  return errorStatusCode;
};
