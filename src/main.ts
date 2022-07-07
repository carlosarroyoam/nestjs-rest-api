import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  // app.use(helmet());
  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('MACUDECAM')
    .setDescription('Especificación de la API para el sistema MACUDECAM.')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}

bootstrap();
