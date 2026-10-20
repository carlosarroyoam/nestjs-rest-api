/** Respuesta de un inicio de sesión exitoso. */
export class LoginResponseDto {
  id!: number;
  username!: string;
  access_token!: string;
}
