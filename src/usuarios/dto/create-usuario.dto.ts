import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @ApiProperty()
  cuenta: string;

  @IsNotEmpty()
  @ApiProperty()
  contrasenia: string;
}
