import { Controller, Get, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';

import * as packageJson from '../package.json';

@Controller()
@ApiExcludeController()
export class AppController {
  @Get()
  async appInfo(@Req() req: Request) {
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
