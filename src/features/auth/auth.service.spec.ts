import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from '@/features/auth/auth.service';
import { User } from '@/features/users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  const jwtService = { sign: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: vi.fn() },
        },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('includes the user role in the token payload', () => {
    jwtService.sign.mockReturnValue('token');

    service.login({
      id: 1,
      username: 'ada',
      role: { name: 'Admin' },
    } as User);

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 1,
      username: 'ada',
      role: 'Admin',
    });
  });
});
