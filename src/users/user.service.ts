import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  create(createUserDto: CreateUserDto): string {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return users;
  }

  async findById(id: number): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ id });

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto): string {
    return `This action updates a #${id} user`;
  }

  remove(id: number): string {
    return `This action removes a #${id} user`;
  }
}
