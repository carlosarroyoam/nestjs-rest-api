import { IsNotEmpty } from 'class-validator';

/** Datos para crear un usuario. Todos los campos son obligatorios. */
export class CreateUserDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  age!: number;

  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  role_id!: number;
}
