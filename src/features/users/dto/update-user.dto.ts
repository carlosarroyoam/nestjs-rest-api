import { PartialType } from '@nestjs/swagger';

import { CreateUserDto } from '@/features/users/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
