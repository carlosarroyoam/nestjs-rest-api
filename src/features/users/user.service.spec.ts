import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Role } from '@/features/users/entities/role.entity';
import { User } from '@/features/users/entities/user.entity';
import { UserService } from '@/features/users/user.service';

describe('UserService', () => {
  let service: UserService;
  const userRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };
  const roleRepository = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('10') },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects creation when the requested role does not exist', async () => {
    userRepository.findOneBy
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    roleRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Ada',
        age: 30,
        email: 'ada@example.com',
        username: 'ada',
        password: 'secret',
        role_id: 99,
      }),
    ).rejects.toThrow('Role not found');
  });

  it('rejects a partial update with an unknown role', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1 });
    roleRepository.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, { role_id: 99 })).rejects.toThrow(
      'Role not found',
    );
  });

  it('does not expose the password in user responses', async () => {
    userRepository.find.mockResolvedValue([
      { id: 1, password: 'hashed-secret' },
    ]);

    const [user] = await service.findAll();

    expect(user).toMatchObject({ id: 1 });
    expect(user).not.toHaveProperty('password');
  });
});
