import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', width: 20 })
  cuenta: string;

  @Column({ type: 'varchar', width: 60 })
  contrasenia: string;

  @Column({ type: 'varchar', width: 60 })
  nombre_completo: string;

  @Column({ type: 'varchar', width: 2 })
  iniciales: string;

  @Column({ type: 'varchar', width: 20 })
  permisos_menus: string;

  @Column({ type: 'varchar', width: 20 })
  permisos_acciones: string;

  @Column({ type: 'boolean' })
  tipo_usuario: boolean;

  @Column({ type: 'integer' })
  id_asociados: number;

  @Column({ type: 'boolean' })
  asociado_titular: boolean;

  @Column({ type: 'varchar', width: 60 })
  usuario_tel: string;

  @Column({ type: 'varchar', width: 60 })
  usuario_mail: string;

  @Column({ type: 'boolean' })
  reg_estatus: boolean;

  @Column({ type: 'integer' })
  reg_alta_id_usuarios: number;

  @Column({ type: 'timestamp without time zone' })
  reg_alta: Date;

  @Column({ type: 'integer' })
  reg_modifica_id_usuarios: number;

  @Column({ type: 'timestamp without time zone' })
  reg_modifica: Date;
}
