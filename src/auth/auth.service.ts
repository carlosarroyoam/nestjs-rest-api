import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';

import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(cuenta: string, contrasenia: string) {
    const user: Usuario = await this.usuariosRepository.findOne({
      where: { cuenta },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const contraseniaEncriptada = createHash('md5')
      .update(contrasenia)
      .digest('hex');

    if (contraseniaEncriptada !== user.contrasenia) {
      throw new ForbiddenException('Contraseña incorrecta');
    }

    return user;
  }

  async login(usuario: Usuario): Promise<LoginResponseDto> {
    const payload = { cuenta: usuario.cuenta, sub: usuario.id };

    return {
      id: usuario.id,
      access_token: this.jwtService.sign(payload),
    };
  }
}
