import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

/** Guard que exige un token JWT válido, validado con `JwtStrategy`. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Procesa el resultado de la autenticación.
   *
   * @param err Error producido durante la autenticación, si lo hubo.
   * @param user Usuario devuelto por `JwtStrategy.validate`, si el token es
   * válido.
   * @returns El usuario autenticado.
   * @throws UnauthorizedException Si el token es inválido o no se envió. Si
   * hubo un error (`err`), lo relanza tal cual.
   */
  handleRequest<TUser = AuthenticatedUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid access token');
    }

    return user;
  }
}
