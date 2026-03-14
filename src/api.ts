import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { appConfig } from '@/config/env/main.config';
import initSwagger from '@/swagger';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { RequestTimeoutInterceptor } from '@/common/interceptors/request-timeout.interceptor';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const corsOptions: CorsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  };
  const isProduction = appConfig.environment === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: corsOptions,
    abortOnError: true
  });
  const httpAdapter = app.get(HttpAdapterHost);

  // Ensure upload directory exists
  const uploadDir = path.resolve(appConfig.uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  app.setGlobalPrefix(appConfig.apiBasePath);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(new RequestTimeoutInterceptor(appConfig.requestTimeout));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      always: true
    })
  );
  app.enableVersioning();
  app.use(cookieParser());

  if (!isProduction) {
    initSwagger(app);
  }

  await app.listen(appConfig.port);

  return {
    log: `WFH Attendance Apps running on ${await app.getUrl()}`,
    url: await app.getUrl()
  };
}

void (async (): Promise<void> => {
  const isProduction = appConfig.environment === 'production';
  const app = await bootstrap();
  NestLogger.log(app.log, 'Bootstrap');
  if (!isProduction)
    NestLogger.log(`Swagger documentation: ${app.url}/${appConfig.apiBasePath}/documentation`, 'Bootstrap');
})();
