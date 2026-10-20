import { Controller, Get, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';

import * as packageJson from '../package.json';

/** Información de la aplicación que devuelve `GET /`. */
export interface AppInfo {
  name: string;
  description: string;
  author: string;
  version: string;
  licence: string;
  documentation: string;
}

/**
 * Endpoint raíz de la API. No lleva el prefijo global `/api/v1` y no aparece en
 * Swagger.
 */
@Controller()
@ApiExcludeController()
export class AppController {
  /**
   * `GET /`. Devuelve información de la aplicación tomada de `package.json`.
   *
   * @param req Petición HTTP, para construir la URL de la documentación.
   * @returns Nombre, descripción, autor, versión, licencia y URL de la
   * documentación (`/docs`).
   */
  @Get()
  appInfo(@Req() req: Request): AppInfo {
    const apiUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;

    return {
      name: packageJson.name,
      description: packageJson.description,
      author: packageJson.author,
      version: packageJson.version,
      licence: packageJson.license,
      documentation: `${apiUrl}docs`,
    };
  }
}
