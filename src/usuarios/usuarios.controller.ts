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
import { ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@ApiTags('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  async findAll() {
    const usuarios: Usuario[] = await this.usuariosService.findAll();
    const usuariosDto = usuarios.map((usuario) =>
      plainToClass(UsuarioResponseDto, usuario),
    );

    return usuariosDto;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const usuarioPorId: Usuario = await this.usuariosService.findOne(+id);
    const usuarioDto = plainToClass(UsuarioResponseDto, usuarioPorId);

    return usuarioDto;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
