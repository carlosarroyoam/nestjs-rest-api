import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  cuenta: string;
}
