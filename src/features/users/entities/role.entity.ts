import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { User } from '@/features/users/entities/user.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryColumn()
  id: number;

  @Column('varchar', { length: 32, nullable: false })
  title: string;

  @Column('varchar', { length: 128, nullable: false })
  description: string;

  @OneToMany(() => User, (user: User) => user.role)
  users: User[];
}
