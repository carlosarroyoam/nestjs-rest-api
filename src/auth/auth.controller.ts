import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  @ApiBody({
    type: 'object',
    schema: {
      properties: {
        cuenta: { type: 'string' },
        contrasenia: { type: 'string' },
      },
    },
  })
  async login(@Request() request) {
    return this.authService.login(request.user);
  }
}
