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
    findOne: jest.fn(),
    existsBy: jest.fn(),
    create: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };
  const roleRepository = { existsBy: jest.fn() };

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
    userRepository.existsBy.mockResolvedValue(false);
    roleRepository.existsBy.mockResolvedValue(false);

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
    userRepository.findOne.mockResolvedValue({ id: 1 });
    roleRepository.existsBy.mockResolvedValue(false);

    await expect(service.update(1, { role_id: 99 })).rejects.toThrow(
      'Role not found',
    );
  });

  it('rejects an update when the user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, { name: 'Ada' })).rejects.toThrow(
      'User not found',
    );
  });

  it('skips the uniqueness check when the email and username are unchanged', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'ada@example.com',
      username: 'ada',
    });

    await service.update(1, { email: 'ada@example.com', username: 'ada' });

    expect(userRepository.existsBy).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('maps password and role_id to entity properties on update', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1 });
    roleRepository.existsBy.mockResolvedValue(true);

    await service.update(1, { name: 'Ada', password: 'new', role_id: 2 });

    const [, changes] = userRepository.update.mock.calls[0] as [
      number,
      Partial<User>,
    ];
    expect(changes).not.toHaveProperty('password');
    expect(changes).not.toHaveProperty('role_id');
    expect(changes).toMatchObject({ name: 'Ada', role: { id: 2 } });
    expect(changes.password_hash).toEqual(expect.any(String));
    expect(changes.password_hash).not.toBe('new');
    expect(changes.updated_at).toBeInstanceOf(Date);
  });

  it('rejects an update with an email used by another user', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'ada@example.com',
    });
    userRepository.existsBy.mockResolvedValue(true);

    await expect(
      service.update(1, { email: 'other@example.com' }),
    ).rejects.toThrow('Email already exists');
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
