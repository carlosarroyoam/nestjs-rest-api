import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });

    if (!user || (await bcrypt.compare(password, user.password))) {
      throw new ForbiddenException('Invalid username or password');
    }

    if (user.is_active === false) {
      throw new ForbiddenException('User account not active');
    }

    return user;
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload = { username: user.username, sub: user.id };

    return {
      id: user.id,
      username: user.username,
      access_token: this.jwtService.sign(payload),
    };
  }
}
