import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioDto } from './dto/usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@ApiTags('usuarios')
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createUsuarioDto: CreateUsuarioDto): string {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene la lista de usuarios' })
  async findAll(): Promise<UsuarioDto[]> {
    const usuarios: Usuario[] = await this.usuariosService.findAll();
    const usuariosDto = usuarios.map((usuario) =>
      plainToClass(UsuarioDto, usuario)
    );

    return usuariosDto;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por su id' })
  async findOne(@Param('id') id: number): Promise<UsuarioDto> {
    const usuarioPorId: Usuario = await this.usuariosService.findOne(id);
    const usuarioDto = plainToClass(UsuarioDto, usuarioPorId);

    return usuarioDto;
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ): string {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: number): string {
    return this.usuariosService.remove(id);
  }
}
