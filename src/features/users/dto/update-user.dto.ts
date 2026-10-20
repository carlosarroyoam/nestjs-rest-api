import { PartialType } from '@nestjs/swagger';

import { CreateUserDto } from '@/features/users/dto/create-user.dto';

/** Datos para actualizar un usuario. Todos los campos son opcionales. */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
