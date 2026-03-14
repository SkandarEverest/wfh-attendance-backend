export const getDefaultValueByCondition = (
  condition: boolean | string | number | (string | number)[] | object | Date | undefined | null,
  value: any,
  defaultValue: any
) => {
  if (condition) return value;

  return defaultValue;
};

export const getSessionTtlMilliseconds = (jwtLifetime?: string | number): number => {
  const fallback = 60 * 60 * 8 * 1000;
  const raw = `${jwtLifetime ?? '8h'}`.trim().toLowerCase();

  if (/^\d+$/.test(raw)) {
    return Number(raw) * 1000;
  }

  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) {
    return fallback;
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === 's') return value * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  if (unit === 'd') return value * 60 * 60 * 24 * 1000;
  return fallback;
};
