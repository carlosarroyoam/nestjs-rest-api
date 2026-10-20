import { IsInt, IsNotEmpty } from 'class-validator';

/** Datos para crear un usuario. Todos los campos son obligatorios. */
export class CreateUserDto {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  age!: number;

  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  password!: string;

  @IsInt()
  role_id!: number;
}
