import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async validateUser(cuenta: string, contrasenia: string) {
    const user: Usuario = await this.usuariosRepository.findOne({
      where: { cuenta },
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'El usuario no esta registrado',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.contrasenia !== contrasenia) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Credenciales incorrectas',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return user;
  }
}
