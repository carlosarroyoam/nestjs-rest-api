import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '@/users/entities/role.entity';
import { User } from '@/users/entities/user.entity';
import { UserController } from '@/users/user.controller';
import { UserService } from '@/users/user.service';

/**
 * Módulo de usuarios: expone `UserController` y registra las entidades `User`
 * y `Role`.
 */
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
