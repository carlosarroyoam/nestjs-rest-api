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

    if (!user) {
      throw new NotFoundException('User not found');
    }

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
    await this.ensureUsernameIsUnique(request.username);
    await this.ensureEmailIsUnique(request.email);

    const role = await this.findRoleByIdOrFail(request.role_id);
    const now = new Date();

    const user = new User();
    user.name = request.name;
    user.age = request.age;
    user.email = request.email;
    user.username = request.username;
    user.password_hash = await this.hashPassword(request.password);
    user.role = role;
    user.is_active = false;
    user.created_at = now;
    user.updated_at = now;
    await this.userRepository.save(user);
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (request.username && request.username !== user.username) {
      await this.ensureUsernameIsUnique(request.username);
    }

    if (request.email && request.email !== user.email) {
      await this.ensureEmailIsUnique(request.email);
    }

    const now = new Date();
    const { password, role_id, ...fields } = request;

    Object.assign(user, fields);

    if (password) {
      user.password_hash = await this.hashPassword(password);
    }

    if (role_id !== undefined) {
      user.role = await this.findRoleByIdOrFail(role_id);
    }

    user.updated_at = now;
    await this.userRepository.save(user);
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    user.is_active = false;
    user.updated_at = now;
    await this.userRepository.save(user);
  }

  /**
   * Verifica que ningún usuario use ya el `username` indicado.
   *
   * @param username Nombre de usuario a validar.
   * @throws BadRequestException Si el `username` ya existe.
   */
  private async ensureUsernameIsUnique(username: string): Promise<void> {
    if (await this.userRepository.existsBy({ username })) {
      throw new BadRequestException('Username already exists');
    }
  }

  /**
   * Verifica que ningún usuario use ya el `email` indicado.
   *
   * @param email Correo electrónico a validar.
   * @throws BadRequestException Si el `email` ya existe.
   */
  private async ensureEmailIsUnique(email: string): Promise<void> {
    if (await this.userRepository.existsBy({ email })) {
      throw new BadRequestException('Email already exists');
    }
  }

  /**
   * Obtiene un rol por su identificador.
   *
   * @param roleId Identificador del rol.
   * @returns El rol encontrado.
   * @throws BadRequestException Si no existe un rol con ese `id`.
   */
  private async findRoleByIdOrFail(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id: roleId });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    return role;
  }

  /**
   * Genera el hash bcrypt de una contraseña.
   *
   * @param password Contraseña en texto plano.
   * @returns El hash resultante.
   */
  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(
      password,
      Number(this.configService.getOrThrow<string>('SALT_ROUNDS')),
    );
  }
}
