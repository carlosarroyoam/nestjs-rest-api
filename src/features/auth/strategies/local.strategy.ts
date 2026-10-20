import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '@/features/auth/auth.service';

/** Estrategia de Passport que autentica con usuario y contraseña. */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Valida las credenciales. Passport asigna el resultado a `request.user`.
   *
   * @param username Nombre de usuario.
   * @param password Contraseña en claro.
   * @returns El usuario autenticado.
   * @throws ForbiddenException Si las credenciales son inválidas o la cuenta
   * está inactiva.
   */
  async validate(username: string, password: string): Promise<any> {
    return this.authService.validateUser(username, password);
  }
}
