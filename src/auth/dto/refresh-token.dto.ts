import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/** Datos para renovar el token de acceso. */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @IsUUID()
  deviceId!: string;
}
