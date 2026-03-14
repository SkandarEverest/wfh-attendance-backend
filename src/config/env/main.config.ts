import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const {
  NODE_ENV,
  PORT,
  API_PREFIX,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_CACHE_TTL,
  UPLOAD_DIR,
  MAX_FILE_SIZE_MB,
  REQUEST_TIMEOUT
} = process.env;

export const appConfig = {
  environment: NODE_ENV ?? 'development',
  port: +(PORT ?? 3000),
  apiBasePath: API_PREFIX ?? 'api',
  jwtSecret: JWT_SECRET ?? 'super-secret-jwt-key',
  jwtLifetime: JWT_EXPIRES_IN ?? '8h',
  uploadDir: UPLOAD_DIR ?? 'uploads',
  maxFileSizeMb: +(MAX_FILE_SIZE_MB ?? 5),
  requestTimeout: +(REQUEST_TIMEOUT ?? 30000)
};

export const moduleConfig = {
  databaseHost: DB_HOST ?? 'localhost',
  databasePort: +(DB_PORT ?? 3306),
  databaseUsername: DB_USER ?? 'root',
  databasePassword: DB_PASSWORD ?? 'root',
  databaseName: DB_NAME ?? 'wfh_attendance',
  redisHost: REDIS_HOST ?? 'localhost',
  redisPort: +(REDIS_PORT ?? 6379),
  redisPassword: REDIS_PASSWORD ?? '',
  redisCacheTtl: +(REDIS_CACHE_TTL ?? 28800)
};
