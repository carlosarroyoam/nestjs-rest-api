import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';

/** Estrategia de Passport que autentica peticiones con un token JWT. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  /**
   * Se ejecuta después de verificar el token. Passport asigna el resultado a
   * `request.user`.
   *
   * @param payload Contenido del token: `sub` (id del usuario), `username` y
   * `role`.
   * @returns El usuario autenticado: `userId`, `username` y `role`.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
