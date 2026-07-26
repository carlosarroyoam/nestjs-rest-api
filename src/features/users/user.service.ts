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

import { CreateUserDto } from '@/features/users/dto/create-user.dto';
import { UpdateUserDto } from '@/features/users/dto/update-user.dto';
import { UserDto } from '@/features/users/dto/user.dto';
import { Role } from '@/features/users/entities/role.entity';
import { User } from '@/features/users/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({ order: { id: 'ASC' } });
    return users.map((user) => plainToClass(UserDto, user));
  }

  async findById(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOneBy({ id });
    return plainToClass(UserDto, user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    if (
      await this.userRepository.findOneBy({ username: createUserDto.username })
    ) {
      throw new BadRequestException('Username already exists');
    }

    if (await this.userRepository.findOneBy({ email: createUserDto.email })) {
      throw new BadRequestException('Email already exists');
    }

    const role = await this.roleRepository.findOneBy({
      id: createUserDto.role_id,
    });
    if (!role) throw new BadRequestException('Role not found');

    const user = this.userRepository.create({
      name: createUserDto.name,
      age: createUserDto.age,
      email: createUserDto.email,
      username: createUserDto.username,
      password: await bcrypt.hash(
        createUserDto.password,
        Number(this.configService.getOrThrow<string>('SALT_ROUNDS')),
      ),
      role,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const createdUser = await this.userRepository.insert(user);
    return plainToClass(UserDto, createdUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    let role: Role | undefined;
    if (updateUserDto.role_id !== undefined) {
      const requestedRole = await this.roleRepository.findOneBy({
        id: updateUserDto.role_id,
      });
      if (!requestedRole) throw new BadRequestException('Role not found');
      role = requestedRole;
    }

    await this.userRepository.update(id, {
      ...(updateUserDto.name !== undefined && { name: updateUserDto.name }),
      ...(updateUserDto.age !== undefined && { age: updateUserDto.age }),
      ...(updateUserDto.email !== undefined && { email: updateUserDto.email }),
      ...(updateUserDto.username !== undefined && {
        username: updateUserDto.username,
      }),
      ...(updateUserDto.password !== undefined && {
        password: await bcrypt.hash(
          updateUserDto.password,
          Number(this.configService.getOrThrow<string>('SALT_ROUNDS')),
        ),
      }),
      ...(role && { role }),
      updated_at: new Date(),
    });
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.update(id, { is_active: false });
  }
}
