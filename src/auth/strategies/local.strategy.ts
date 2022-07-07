import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'cuenta',
      passwordField: 'contrasenia',
    });
  }

  async validate(cuenta: string, contrasenia: string): Promise<any> {
    const user = await this.authService.validateUser(cuenta, contrasenia);

    return user;
  }
}
