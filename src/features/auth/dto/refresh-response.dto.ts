/** Respuesta de una renovación de token exitosa. */
export class RefreshResponseDto {
  accessToken!: string;
  refreshToken!: string;
}
