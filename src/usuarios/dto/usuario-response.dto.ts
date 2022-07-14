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
  reg_alta_id_usuarios: number;
  reg_alta: Date;
  reg_modifica_id_usuarios: number;
  reg_modifica: Date;
}
