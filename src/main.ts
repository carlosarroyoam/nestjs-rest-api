import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from '@/app.module';

/**
 * Convierte los errores anidados de `class-validator` en una lista plana, con
 * rutas separadas por puntos para las propiedades anidadas (`address.city`).
 *
 * @param errors Errores de validación.
 * @param parentPath Ruta de la propiedad padre. Vacía en el nivel superior.
 * @returns Lista de `{ property, message }`, una por propiedad inválida.
 */
function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): { property: string; message?: string }[] {
  return errors.flatMap((item) => {
    const property = parentPath
      ? `${parentPath}.${item.property}`
      : item.property;

    if (item.children?.length) {
      return flattenValidationErrors(item.children, property);
    }

    return [{ property, message: Object.values(item.constraints ?? {}).pop() }];
  });
}

/** Configura e inicia la aplicación en el puerto 3000. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  app.setGlobalPrefix('/api/v1', { exclude: [''] });

  app.enableCors({
    origin: ['http://localhost:4200'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          message: 'Error de validación',
          errors: flattenValidationErrors(errors),
        });
      },
    }),
  );

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('nestjs-rest-api')
        .setDescription('Nestjs Rest Api')
        .setVersion('1.0')
        .addTag('auth')
        .addTag('users')
        .addBearerAuth()
        .build(),
    ),
  );

  await app.listen(3000);
}

void bootstrap();
