export class UsuarioResponseDto {
  id: number;
  cuenta: string;
  contrasenia: string;
  nombre_completo: string;
  iniciales: string;
  permisos_menus: string;
  permisos_acciones: string;
  tipo_usuario: boolean;
  id_asociados: number;
  asociado_titular: boolean;
  usuario_tel: string;
  usuario_mail: string;
  reg_estatus: boolean;
}
