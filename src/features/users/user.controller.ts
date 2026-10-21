import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/features/auth/guards/jwt-guard';
import type { AuthenticatedUser } from '@/features/auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from '@/features/users/dto/create-user.dto';
import { UpdateUserDto } from '@/features/users/dto/update-user.dto';
import { UserDto } from '@/features/users/dto/user.dto';
import { ADMIN_ROLE } from '@/features/users/entities/role.entity';
import { UserService } from '@/features/users/user.service';

/** Endpoints REST de usuarios, en `/users`. Requieren un token JWT válido. */
@Controller('/users')
@UseGuards(JwtAuthGuard)
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * `GET /users`. Lista todos los usuarios.
   *
   * @returns Lista de usuarios.
   */
  @Get()
  @ApiOperation({ summary: 'Gets the list of users' })
  async findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  /**
   * `GET /users/:id`. Obtiene un usuario.
   *
   * @param userId Identificador del usuario.
   * @returns El usuario encontrado. Responde 404 si no existe.
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Gets a user by its id' })
  async findOne(@Param('userId') userId: number): Promise<UserDto> {
    return this.userService.findById(userId);
  }

  /**
   * `POST /users`. Crea un usuario. Responde 201 sin cuerpo.
   *
   * @param createUserDto Datos del nuevo usuario.
   */
  @Post()
  @ApiOperation({ summary: 'Adds a new user' })
  async create(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.userService.create(createUserDto);
  }

  /**
   * `PATCH /users/:id`. Actualiza parcialmente un usuario. Responde 204.
   *
   * @param userId Identificador del usuario.
   * @param updateUserDto Campos a modificar.
   * @param currentUser Usuario autenticado. Responde 403 si no es `userId` ni
   * administrador.
   */
  @Patch(':userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Updates a user by its id' })
  async update(
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    if (currentUser.userId !== userId && currentUser.role !== ADMIN_ROLE) {
      throw new ForbiddenException('You can only update your own user');
    }

    await this.userService.update(userId, updateUserDto);
  }

  /**
   * `DELETE /users/:id`. Da de baja un usuario con borrado lógico: lo marca
   * como inactivo. Responde 204.
   *
   * @param userId Identificador del usuario.
   */
  @Delete(':userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletes a user by its id' })
  async remove(@Param('userId') userId: number): Promise<void> {
    await this.userService.remove(userId);
  }
}
