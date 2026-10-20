import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { LoginResponseDto } from '@/features/auth/dto/login-response.dto';
import { JwtPayload } from '@/features/auth/interfaces/jwt-payload.interface';
import { User } from '@/features/users/entities/user.entity';

/** Lógica de autenticación: valida credenciales y emite tokens JWT. */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales de un usuario.
   *
   * @param username Nombre de usuario.
   * @param password Contraseña en claro, que se compara con `password_hash`.
   * @returns El usuario, si las credenciales son correctas y la cuenta está
   * activa.
   * @throws ForbiddenException Si el usuario no existe o la contraseña es
   * incorrecta (mismo mensaje en ambos casos), o si la cuenta está inactiva.
   */
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new ForbiddenException('Invalid username or password');
    }

    if (user.is_active === false) {
      throw new ForbiddenException('User account not active');
    }

    return user;
  }

  /**
   * Genera el token de acceso de un usuario ya validado.
   *
   * El token incluye `username` y `sub` (id del usuario). Su vigencia depende
   * de `JWT_EXPIRES_IN`.
   *
   * @param user Usuario autenticado.
   * @returns Datos del usuario y el token JWT firmado.
   */
  login(user: User): LoginResponseDto {
    const payload: JwtPayload = { username: user.username, sub: user.id };

    return {
      id: user.id,
      username: user.username,
      access_token: this.jwtService.sign(payload),
    };
  }
}
