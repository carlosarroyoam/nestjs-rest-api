import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para cerrar sesión. */
export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
