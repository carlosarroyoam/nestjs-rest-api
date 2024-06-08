import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return users.map((user) => plainToClass(UserDto, user));
  }

  async findById(id: number): Promise<UserDto> {
    const userById = this.userRepository.findOneBy({ id });
    return plainToClass(UserDto, userById);
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const userByUsername = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });

    if (userByUsername)
      throw new BadRequestException('Username already exists');

    const userByEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (userByEmail) throw new BadRequestException('Email already exists');

    const role = await this.roleRepository.findOneBy({
      id: createUserDto.role_id,
    });

    const user = this.userRepository.create({
      name: createUserDto.name,
      age: createUserDto.age,
      email: createUserDto.email,
      username: createUserDto.username,
      password: await bcrypt.hash(
        createUserDto.password,
        this.configService.get('SALT_ROUNDS')
      ),
      role: role,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const createdUser = await this.userRepository.insert(user);

    return plainToClass(UserDto, createdUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    const role = await this.roleRepository.findOneBy({
      id: updateUserDto.role_id,
    });

    const userById = await this.userRepository.findOneBy({ id });

    if (!userById) throw new NotFoundException('User not found');

    await this.userRepository.update(userById.id, {
      name: updateUserDto.name,
      age: updateUserDto.age,
      email: updateUserDto.email,
      username: updateUserDto.username,
      password: await bcrypt.hash(
        updateUserDto.password,
        this.configService.get('SALT_ROUNDS')
      ),
      role: role,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async remove(id: number): Promise<void> {
    const userById = await this.userRepository.findOneBy({ id });

    if (!userById) throw new NotFoundException('User not found');

    await this.userRepository.update(userById.id, {
      is_active: false,
    });
  }
}
