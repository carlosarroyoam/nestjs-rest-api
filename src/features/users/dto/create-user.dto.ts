import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

/** Datos para crear un usuario. Todos los campos son obligatorios. */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;

  @IsInt()
  age!: number;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(128)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsInt()
  role_id!: number;
}
