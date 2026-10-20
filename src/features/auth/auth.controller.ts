import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from '@/features/auth/auth.service';
import { LoginResponseDto } from '@/features/auth/dto/login-response.dto';
import { LoginDto } from '@/features/auth/dto/login.dto';
import { LocalAuthGuard } from '@/features/auth/guards/local-guard';
import type { AuthenticatedRequest } from '@/features/auth/interfaces/authenticated-request.interface';

/** Endpoints de autenticación, en `/auth`. */
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * `POST /auth/login`. Inicia sesión con usuario y contraseña.
   *
   * @param request Petición HTTP, con el usuario autenticado en `user`.
   * @returns Datos del usuario y el token JWT.
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auths a user' })
  @ApiBody({ type: LoginDto })
  login(@Request() request: AuthenticatedRequest): LoginResponseDto {
    return this.authService.login(request.user);
  }
}
