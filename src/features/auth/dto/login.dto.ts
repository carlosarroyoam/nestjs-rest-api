import { IsNotEmpty } from 'class-validator';

/** Credenciales para iniciar sesión. */
export class LoginDto {
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  password!: string;
}
