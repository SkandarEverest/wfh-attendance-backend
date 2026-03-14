import { TransformFnParams } from 'class-transformer';

export const transformIntoNumber = ({ value }: TransformFnParams): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsedValue = Number.parseInt(String(value), 10);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};
