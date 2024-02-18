import { BoolBitTransformer } from 'src/core/transformers/bool-byte.transformer';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', width: 128, nullable: false })
  name: string;

  @Column({ type: 'tinyint' })
  age: number;

  @Column({ type: 'varchar', width: 128, nullable: false })
  email: string;

  @Column({ type: 'varchar', width: 128, nullable: false })
  username: string;

  @Column({ type: 'varchar', width: 128, nullable: false })
  password: string;

  @Column({ type: 'varchar', width: 32, nullable: false })
  role: string;

  @Column({
    type: 'bit',
    width: 1,
    nullable: false,
    transformer: new BoolBitTransformer(),
  })
  is_active: boolean;

  @Column({ type: 'datetime', nullable: false })
  created_at: Date;

  @Column({ type: 'datetime', nullable: false })
  updated_at: Date;
}
