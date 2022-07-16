import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty()
  cuenta: string;

  @IsNotEmpty()
  @ApiProperty()
  contrasenia: string;
}
