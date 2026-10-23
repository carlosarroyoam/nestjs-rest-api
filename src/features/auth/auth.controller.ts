import {
  Body,
  Controller,
  Headers,
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
import { LogoutDto } from '@/features/auth/dto/logout.dto';
import { RefreshResponseDto } from '@/features/auth/dto/refresh-response.dto';
import { RefreshTokenDto } from '@/features/auth/dto/refresh-token.dto';
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
   * @param loginDto Cuerpo de la petición, del que se toma el `deviceId`.
   * @param userAgent Cabecera `User-Agent` de la petición.
   * @returns Datos del usuario, el token JWT y el refresh token.
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auths a user' })
  @ApiBody({ type: LoginDto })
  login(
    @Request() request: AuthenticatedRequest,
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent?: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(request.user, loginDto.deviceId, userAgent);
  }

  /**
   * `POST /auth/refresh-token`. Renueva el token de acceso con un refresh token.
   *
   * @param refreshTokenDto Refresh token y deviceId del dispositivo.
   * @param userAgent Cabecera `User-Agent` de la petición.
   * @returns Nuevo token de acceso y nuevo refresh token.
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refreshes an access token' })
  refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('user-agent') userAgent?: string,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(
      refreshTokenDto.refreshToken,
      refreshTokenDto.deviceId,
      userAgent,
    );
  }

  /**
   * `POST /auth/logout`. Cierra la sesión del dispositivo.
   *
   * @param logoutDto Refresh token a invalidar.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logs out a device' })
  logout(@Body() logoutDto: LogoutDto): Promise<void> {
    return this.authService.logout(logoutDto.refreshToken);
  }
}
