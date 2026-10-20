import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard que valida usuario y contraseña con `LocalStrategy`. */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
