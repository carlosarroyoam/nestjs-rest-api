import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(cuenta: string, contrasenia: string) {
    const user: Usuario = await this.usuariosRepository.findOne({
      where: { cuenta },
    });

    if (!user) {
      throw new NotFoundException('El usuario no esta registrado');
    }

    if (user.contrasenia !== contrasenia) {
      throw new ForbiddenException('Credenciales incorrectas');
    }

    return user;
  }

  async login(usuario: Usuario) {
    const payload = { cuenta: usuario.cuenta, sub: usuario.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
