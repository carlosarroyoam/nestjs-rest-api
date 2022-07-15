import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  cuenta: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  contrasenia: string;
}
