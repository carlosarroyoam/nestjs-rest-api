import { Expose } from 'class-transformer';

/** Representación pública de un rol en las respuestas de la API. */
export class RoleDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  description!: string;
}
