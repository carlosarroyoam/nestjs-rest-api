import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { BoolBitTransformer } from '@/core/transformers/bool-byte.transformer';
import { Role } from '@/features/users/entities/role.entity';

/** Usuario de la aplicación. Tabla `users`. */
@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id!: number;

  @Column('varchar', { length: 128, nullable: false })
  name!: string;

  @Column('tinyint')
  age!: number;

  @Column('varchar', { length: 128, nullable: false })
  email!: string;

  @Column('varchar', { length: 128, nullable: false })
  username!: string;

  @Column('varchar', { length: 128, nullable: false })
  password_hash!: string;

  @ManyToOne(() => Role, (role: Role) => role.users)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role!: Role;

  @Column('bit', {
    nullable: false,
    transformer: new BoolBitTransformer(),
  })
  is_active!: boolean;

  @Column('datetime', { nullable: false })
  created_at!: Date;

  @Column('datetime', { nullable: false })
  updated_at!: Date;
}
