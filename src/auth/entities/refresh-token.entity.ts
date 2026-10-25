import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/users/entities/user.entity';

/** Refresh token de un dispositivo. Tabla `refresh_tokens`. */
@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { name: 'token_hash', length: 254, nullable: false })
  tokenHash!: string;

  @Column('varchar', { name: 'device_id', length: 36, nullable: false })
  deviceId!: string;

  @Column('varchar', { name: 'user_agent', length: 254, nullable: true })
  userAgent!: string | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: User;

  @Column('timestamp', { name: 'expires_on', nullable: false })
  expiresOn!: Date;

  @Column('timestamp', { name: 'last_used_at', nullable: true })
  lastUsedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt!: Date;
}
