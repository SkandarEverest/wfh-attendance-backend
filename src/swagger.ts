import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

export default function initSwagger(app: NestExpressApplication) {
  const docOptions: SwaggerDocumentOptions = {
    ignoreGlobalPrefix: true
  };
  const options: SwaggerCustomOptions = {
    useGlobalPrefix: true,
    customSiteTitle: `WFH Attendance Api Documentation - Swagger`
  };

  const config = new DocumentBuilder()
    .setTitle('WFH Attendance Backend API')
    .setDescription('WFH Attendance Web Application - Backend API built with NestJS + TypeORM')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header'
      },
      'jwt'
    )
    .addTag('WFH Attendance')
    .build();
  const document = SwaggerModule.createDocument(app.enableVersioning(), config, docOptions);
  SwaggerModule.setup('documentation', app, document, options);
}
