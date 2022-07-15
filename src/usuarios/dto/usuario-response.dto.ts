import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UsuarioResponseDto {
  @Expose()
  id: number;

  @Expose()
  cuenta: string;

  @Expose()
  nombre_completo: string;

  @Expose()
  iniciales: string;

  @Expose()
  permisos_menus: string;

  @Expose()
  permisos_acciones: string;

  @Expose()
  tipo_usuario: boolean;

  @Expose()
  id_asociados: number;

  @Expose()
  asociado_titular: boolean;

  @Expose()
  usuario_tel: string;

  @Expose()
  usuario_mail: string;

  @Expose()
  reg_estatus: boolean;
}
