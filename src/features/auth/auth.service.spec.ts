import { createHash } from 'node:crypto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from '@/features/auth/auth.service';
import { RefreshToken } from '@/features/auth/entities/refresh-token.entity';
import { User } from '@/features/users/entities/user.entity';

const createRecord = (value: Partial<RefreshToken>): object => ({
  ...value,
});

const hash = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

describe('AuthService', () => {
  let service: AuthService;
  const jwtService = { sign: vi.fn() };
  const tokenRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const user = {
    id: 1,
    username: 'ada',
    isActive: true,
    role: { name: 'Admin' },
  } as User;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: vi.fn() },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: tokenRepository,
        },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: vi.fn().mockReturnValue('7') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('includes the user role in the token payload', async () => {
      jwtService.sign.mockReturnValue('token');
      tokenRepository.findOne.mockResolvedValue(null);
      tokenRepository.create.mockImplementation(createRecord);

      await service.login(user, 'device-1');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        username: 'ada',
        role: 'Admin',
      });
    });

    it('stores only the hash of the returned refresh token', async () => {
      jwtService.sign.mockReturnValue('token');
      tokenRepository.findOne.mockResolvedValue(null);
      tokenRepository.create.mockImplementation(createRecord);

      const result = await service.login(user, 'device-1', 'jest-agent');

      expect(tokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: hash(result.refreshToken),
          deviceId: 'device-1',
          userAgent: 'jest-agent',
        }),
      );
    });

    it('replaces the token of an already registered device', async () => {
      jwtService.sign.mockReturnValue('token');
      const existing = {
        id: 5,
        tokenHash: 'old-hash',
        deviceId: 'device-1',
      };
      tokenRepository.findOne.mockResolvedValue(existing);

      const result = await service.login(user, 'device-1');

      expect(tokenRepository.create).not.toHaveBeenCalled();
      expect(tokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          tokenHash: hash(result.refreshToken),
        }),
      );
    });
  });

  describe('refresh', () => {
    const record = (
      overrides: Partial<RefreshToken> = {},
    ): Partial<RefreshToken> => ({
      id: 5,
      tokenHash: hash('current'),
      deviceId: 'device-1',
      updatedAt: new Date(),
      user,
      ...overrides,
    });

    it('rotates the token and returns a new pair', async () => {
      jwtService.sign.mockReturnValue('access');
      tokenRepository.findOne.mockResolvedValue(record());
      tokenRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.refresh('current', 'device-1');

      expect(result.accessToken).toBe('access');
      expect(result.refreshToken).not.toBe('current');
      expect(tokenRepository.update).toHaveBeenCalledWith(
        { id: 5, tokenHash: hash('current') },
        expect.objectContaining({ tokenHash: hash(result.refreshToken) }),
      );
    });

    it('rejects an unknown token', async () => {
      tokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh('nope', 'device-1')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('rejects a token from another device', async () => {
      tokenRepository.findOne.mockResolvedValue(record());

      await expect(service.refresh('current', 'device-2')).rejects.toThrow(
        'Invalid refresh token',
      );
      expect(tokenRepository.update).not.toHaveBeenCalled();
    });

    it('rejects and deletes an expired token', async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      tokenRepository.findOne.mockResolvedValue(
        record({ updatedAt: eightDaysAgo }),
      );

      await expect(service.refresh('current', 'device-1')).rejects.toThrow(
        'Invalid refresh token',
      );
      expect(tokenRepository.delete).toHaveBeenCalledWith({ id: 5 });
    });

    it('rejects a token of an inactive user', async () => {
      tokenRepository.findOne.mockResolvedValue(
        record({ user: { ...user, isActive: false } }),
      );

      await expect(service.refresh('current', 'device-1')).rejects.toThrow(
        'User account not active',
      );
    });

    it('rejects a token that was rotated concurrently', async () => {
      tokenRepository.findOne.mockResolvedValue(record());
      tokenRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.refresh('current', 'device-1')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('logout', () => {
    it('deletes the token by its hash', async () => {
      await service.logout('current');

      expect(tokenRepository.delete).toHaveBeenCalledWith({
        tokenHash: hash('current'),
      });
    });
  });
});
