import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/** Estrategia de Passport que autentica peticiones con un token JWT. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Se ejecuta después de verificar el token. Passport asigna el resultado a
   * `request.user`.
   *
   * @param payload Contenido del token: `sub` (id del usuario) y `username`.
   * @returns El usuario autenticado: `userId` y `username`.
   */
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
