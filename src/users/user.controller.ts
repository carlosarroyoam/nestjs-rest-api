import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('/users')
@UseGuards(JwtAuthGuard)
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createUserDto: CreateUserDto): string {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Gets the list of users' })
  async findAll(): Promise<UserDto[]> {
    const users: User[] = await this.userService.findAll();
    const usersDto = users.map((user) => plainToClass(UserDto, user));

    return usersDto;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Gets a user by its id' })
  async findOne(@Param('id') id: number): Promise<UserDto> {
    const userById: User = await this.userService.findById(id);
    const userDto = plainToClass(UserDto, userById);

    return userDto;
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto
  ): string {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: number): string {
    return this.userService.remove(id);
  }
}
