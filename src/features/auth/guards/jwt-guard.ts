import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard que exige un token JWT válido, validado con `JwtStrategy`. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Procesa el resultado de la autenticación.
   *
   * @param err Error producido durante la autenticación, si lo hubo.
   * @param user Usuario devuelto por `JwtStrategy.validate`, si el token es
   * válido.
   * @param info Información adicional de Passport. No se usa.
   * @returns El usuario autenticado.
   * @throws UnauthorizedException Si el token es inválido o no se envió. Si
   * hubo un error (`err`), lo relanza tal cual.
   */
  handleRequest(err, user, _info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid access token');
    }

    return user;
  }
}
