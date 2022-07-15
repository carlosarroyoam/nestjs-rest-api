import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  cuenta: string;

  @ApiProperty()
  constrasenia: string;
}
