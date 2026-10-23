import { createHash, randomBytes } from 'node:crypto';

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { LoginResponseDto } from '@/features/auth/dto/login-response.dto';
import { RefreshResponseDto } from '@/features/auth/dto/refresh-response.dto';
import { RefreshToken } from '@/features/auth/entities/refresh-token.entity';
import { JwtPayload } from '@/features/auth/interfaces/jwt-payload.interface';
import { User } from '@/features/users/entities/user.entity';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const USER_AGENT_MAX_LENGTH = 254;

/** Lógica de autenticación: valida credenciales y emite tokens JWT. */
@Injectable()
export class AuthService {
  private readonly refreshTokenTtlMs: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.refreshTokenTtlMs =
      Number(configService.getOrThrow<string>('REFRESH_TOKEN_TTL_DAYS')) *
      MS_PER_DAY;
  }

  /**
   * Valida las credenciales de un usuario.
   *
   * @param username Nombre de usuario.
   * @param password Contraseña en claro, que se compara con `passwordHash`.
   * @returns El usuario, si las credenciales son correctas y la cuenta está
   * activa.
   * @throws ForbiddenException Si el usuario no existe o la contraseña es
   * incorrecta (mismo mensaje en ambos casos), o si la cuenta está inactiva.
   */
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ForbiddenException('Invalid username or password');
    }

    if (user.isActive === false) {
      throw new ForbiddenException('User account not active');
    }

    return user;
  }

  /**
   * Genera el token de acceso y el refresh token de un usuario ya validado.
   *
   * @param user Usuario autenticado, con su rol cargado.
   * @param deviceId Identificador del dispositivo; un nuevo inicio de sesión
   * desde el mismo dispositivo reemplaza su refresh token anterior.
   * @param userAgent Cabecera `User-Agent` de la petición.
   * @returns Datos del usuario y los tokens firmados.
   */
  async login(
    user: User,
    deviceId: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.saveRefreshToken(user, deviceId, userAgent);

    return {
      id: user.id,
      username: user.username,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Canjea un refresh token por un nuevo par de tokens y lo rota.
   *
   * @param refreshToken Refresh token vigente.
   * @param deviceId Identificador del dispositivo que lo recibió al iniciar
   * sesión.
   * @param userAgent Cabecera `User-Agent` de la petición.
   * @returns Nuevo token de acceso y nuevo refresh token.
   * @throws UnauthorizedException Si el token no existe, ya fue usado, expiró
   * o pertenece a otro dispositivo.
   * @throws ForbiddenException Si la cuenta está inactiva.
   */
  async refreshToken(
    refreshToken: string,
    deviceId: string,
    userAgent?: string,
  ): Promise<RefreshResponseDto> {
    const currentHash = this.hashToken(refreshToken);
    const record = await this.refreshTokenRepository.findOne({
      where: { tokenHash: currentHash },
      relations: { user: { role: true } },
    });

    if (!record || record.deviceId !== deviceId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.expiresOn.getTime() < Date.now()) {
      await this.refreshTokenRepository.delete({ id: record.id });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.user.isActive === false) {
      throw new ForbiddenException('User account not active');
    }

    const now = new Date();
    const newAccessToken = this.signAccessToken(record.user);
    const newRefreshToken = this.generateRefreshToken();

    // Condicionar a `tokenHash` evita que dos refresh concurrentes con el mismo
    // token roten ambos.
    const { affected } = await this.refreshTokenRepository.update(
      { id: record.id, tokenHash: currentHash },
      {
        tokenHash: this.hashToken(newRefreshToken),
        userAgent: this.truncateUserAgent(userAgent),
        expiresOn: new Date(now.getTime() + this.refreshTokenTtlMs),
        lastUsedAt: now,
        updatedAt: now,
      },
    );

    if (!affected) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Cierra la sesión de un dispositivo invalidando su refresh token.
   *
   * @param refreshToken Refresh token a invalidar; si no existe no hace nada.
   */
  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.delete({
      tokenHash: this.hashToken(refreshToken),
    });
  }

  /** Firma el token de acceso con `username`, `sub` y `role` del usuario. */
  private signAccessToken(user: User): string {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role.name,
    };

    return this.jwtService.sign(payload);
  }

  /** Crea o reemplaza el refresh token del usuario en ese dispositivo. */
  private async saveRefreshToken(
    user: User,
    deviceId: string,
    userAgent?: string,
  ): Promise<string> {
    const refreshToken = this.generateRefreshToken();
    const record =
      (await this.refreshTokenRepository.findOne({
        where: { user: { id: user.id }, deviceId },
      })) ?? this.refreshTokenRepository.create({ user, deviceId });

    const now = new Date();
    record.tokenHash = this.hashToken(refreshToken);
    record.userAgent = this.truncateUserAgent(userAgent);
    record.expiresOn = new Date(now.getTime() + this.refreshTokenTtlMs);
    record.createdAt = now;
    record.updatedAt = now;
    await this.refreshTokenRepository.save(record);

    return refreshToken;
  }

  /**
   * Genera un refresh token aleatorio de 32 bytes.
   *
   * @returns El token en claro, codificado en base64url.
   */
  private generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Calcula el hash con el que se almacena un refresh token.
   *
   * @param token Refresh token en claro.
   * @returns Hash SHA-256 del token, en hexadecimal.
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Recorta el `User-Agent` al largo de la columna `user_agent`.
   *
   * @param userAgent Cabecera `User-Agent` de la petición, si la hay.
   * @returns El valor recortado, o `null` si la petición no la traía.
   */
  private truncateUserAgent(userAgent?: string): string | null {
    return userAgent?.slice(0, USER_AGENT_MAX_LENGTH) ?? null;
  }
}
