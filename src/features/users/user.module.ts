import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '@/features/users/entities/role.entity';
import { User } from '@/features/users/entities/user.entity';
import { UserController } from '@/features/users/user.controller';
import { UserService } from '@/features/users/user.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
