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

  @Column('varchar', { name: 'password_hash', length: 128, nullable: false })
  passwordHash!: string;

  @ManyToOne(() => Role, (role: Role) => role.users, { nullable: false })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role!: Role;

  @Column('bit', {
    name: 'is_active',
    nullable: false,
    transformer: new BoolBitTransformer(),
  })
  isActive!: boolean;

  @Column('datetime', { name: 'created_at', nullable: false })
  createdAt!: Date;

  @Column('datetime', { name: 'updated_at', nullable: false })
  updatedAt!: Date;
}
