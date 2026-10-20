import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateUserDto } from '@/features/users/dto/create-user.dto';
import { UpdateUserDto } from '@/features/users/dto/update-user.dto';
import { UserDto } from '@/features/users/dto/user.dto';
import { Role } from '@/features/users/entities/role.entity';
import { User } from '@/features/users/entities/user.entity';

/** Lógica de negocio de los usuarios: consulta, alta, actualización y baja. */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Obtiene todos los usuarios, ordenados por `id` ascendente.
   *
   * @returns Lista de usuarios.
   */
  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      relations: { role: true },
      order: { id: 'ASC' },
    });
    return users.map((user) =>
      plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
    );
  }

  /**
   * Obtiene un usuario por su identificador.
   *
   * @param userId Identificador del usuario.
   * @returns El usuario encontrado.
   * @throws NotFoundException Si no existe un usuario con ese `id`.
   */
  async findById(userId: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  /**
   * Crea un usuario con la cuenta inactiva (`is_active = false`).
   *
   * @param request Datos del nuevo usuario.
   * @throws BadRequestException Si el `username` o el `email` ya existen, o si
   * el `role_id` no corresponde a un rol.
   */
  async create(request: CreateUserDto): Promise<void> {
    if (await this.userRepository.findOneBy({ username: request.username })) {
      throw new BadRequestException('Username already exists');
    }

    if (await this.userRepository.findOneBy({ email: request.email })) {
      throw new BadRequestException('Email already exists');
    }

    const role = await this.roleRepository.findOneBy({
      id: request.role_id,
    });
    if (!role) throw new BadRequestException('Role not found');

    const user = this.userRepository.create({
      name: request.name,
      age: request.age,
      email: request.email,
      username: request.username,
      password_hash: await bcrypt.hash(
        request.password,
        Number(this.configService.getOrThrow<string>('SALT_ROUNDS')),
      ),
      role,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.userRepository.insert(user);
  }

  /**
   * Actualiza de forma parcial un usuario: solo modifica los campos presentes
   * en `request`. Si se envía `password`, se guarda su nuevo hash. Siempre
   * actualiza `updated_at`.
   *
   * @param userId Identificador del usuario.
   * @param request Campos a modificar.
   * @throws NotFoundException Si no existe un usuario con ese `id`.
   * @throws BadRequestException Si se envía un `role_id` que no corresponde a
   * un rol.
   */
  async update(userId: number, request: UpdateUserDto): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    let role: Role | undefined;
    if (request.role_id !== undefined) {
      const requestedRole = await this.roleRepository.findOneBy({
        id: request.role_id,
      });
      if (!requestedRole) throw new BadRequestException('Role not found');
      role = requestedRole;
    }

    await this.userRepository.update(userId, {
      ...(request.name !== undefined && { name: request.name }),
      ...(request.age !== undefined && { age: request.age }),
      ...(request.email !== undefined && { email: request.email }),
      ...(request.username !== undefined && {
        username: request.username,
      }),
      ...(request.password !== undefined && {
        password_hash: await bcrypt.hash(
          request.password,
          Number(this.configService.getOrThrow<string>('SALT_ROUNDS')),
        ),
      }),
      ...(role && { role }),
      updated_at: new Date(),
    });
  }

  /**
   * Da de baja un usuario con borrado lógico: marca la cuenta como inactiva
   * (`is_active = false`) y conserva el registro.
   *
   * @param userId Identificador del usuario.
   * @throws NotFoundException Si no existe un usuario con ese `id`.
   */
  async remove(userId: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.update(userId, { is_active: false });
  }
}
