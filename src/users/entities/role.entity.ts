import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', width: 32, nullable: false })
  title: string;

  @Column({ type: 'varchar', width: 128, nullable: false })
  description: string;

  @OneToMany(() => User, (user: User) => user.role)
  users: User[];
}
