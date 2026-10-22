import { Expose, Type } from 'class-transformer';

import { RoleDto } from '@/features/users/dto/role.dto';

/** Representación pública de un usuario en las respuestas de la API. */
export class UserDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  age!: number;

  @Expose()
  email!: string;

  @Expose()
  username!: string;

  @Expose()
  @Type(() => RoleDto)
  role!: RoleDto;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
