import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:4200'],
  });

  app.setGlobalPrefix('api', { exclude: [''] });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(helmet());
  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('MACUDECAM')
    .setDescription('Especificación de la API para el sistema MACUDECAM.')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('usuarios')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}

bootstrap();
