import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { User } from '@/users/entities/user.entity';

/** Valor de `Role.type` del rol de administrador. */
export const ADMIN_ROLE = 'Admin';

/** Rol que determina el perfil de un usuario. Tabla `roles`. */
@Entity({ name: 'roles' })
export class Role {
  @PrimaryColumn()
  id!: number;

  @Column('varchar', { length: 32, nullable: false })
  name!: string;

  @Column('varchar', { length: 128, nullable: false })
  description!: string;

  @OneToMany(() => User, (user: User) => user.role)
  users!: User[];
}
