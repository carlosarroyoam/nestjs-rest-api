import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Role } from '@/users/entities/role.entity';
import { User } from '@/users/entities/user.entity';
import { UserService } from '@/users/user.service';

describe('UserService', () => {
  let service: UserService;
  const userRepository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    existsBy: vi.fn(),
    save: vi.fn(),
  };
  const roleRepository = { findOneBy: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        {
          provide: ConfigService,
          useValue: { getOrThrow: vi.fn().mockReturnValue('10') },
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
    roleRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Ada',
        age: 30,
        email: 'ada@example.com',
        username: 'ada',
        password: 'secret',
        roleId: 99,
      }),
    ).rejects.toThrow('Role not found');
  });

  it('rejects a partial update with an unknown role', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1 });
    roleRepository.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, { roleId: 99 })).rejects.toThrow(
      'Role not found',
    );
  });

  it('rejects an update when the user does not exist', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, { name: 'Ada' })).rejects.toThrow(
      'User not found',
    );
  });

  it('skips the uniqueness check when the email and username are unchanged', async () => {
    userRepository.findOneBy.mockResolvedValue({
      id: 1,
      email: 'ada@example.com',
      username: 'ada',
    });

    await service.update(1, { email: 'ada@example.com', username: 'ada' });

    expect(userRepository.existsBy).not.toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('maps password and roleId to entity properties on update', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1 });
    roleRepository.findOneBy.mockResolvedValue({ id: 2 });

    await service.update(1, { name: 'Ada', password: 'new', roleId: 2 });

    const [saved] = userRepository.save.mock.calls[0] as [User];
    expect(saved).not.toHaveProperty('password');
    expect(saved).not.toHaveProperty('roleId');
    expect(saved).toMatchObject({ id: 1, name: 'Ada', role: { id: 2 } });
    expect(saved.passwordHash).toEqual(expect.any(String));
    expect(saved.passwordHash).not.toBe('new');
    expect(saved.updatedAt).toBeInstanceOf(Date);
  });

  it('rejects an update with an email used by another user', async () => {
    userRepository.findOneBy.mockResolvedValue({
      id: 1,
      email: 'ada@example.com',
    });
    userRepository.existsBy.mockResolvedValue(true);

    await expect(
      service.update(1, { email: 'other@example.com' }),
    ).rejects.toThrow('Email already exists');
  });

  it('creates an inactive user with a hashed password', async () => {
    userRepository.existsBy.mockResolvedValue(false);
    roleRepository.findOneBy.mockResolvedValue({ id: 2 });

    await service.create({
      name: 'Ada',
      age: 30,
      email: 'ada@example.com',
      username: 'ada',
      password: 'secret',
      roleId: 2,
    });

    const [saved] = userRepository.save.mock.calls[0] as [User];
    expect(saved).toBeInstanceOf(User);
    expect(saved).toMatchObject({
      name: 'Ada',
      isActive: false,
      role: { id: 2 },
    });
    expect(saved).not.toHaveProperty('password');
    expect(saved.passwordHash).not.toBe('secret');
  });

  it('soft-deletes a user by marking it inactive', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1, isActive: true });

    await service.remove(1);

    const [saved] = userRepository.save.mock.calls[0] as [User];
    expect(saved).toMatchObject({ id: 1, isActive: false });
    expect(saved.updatedAt).toBeInstanceOf(Date);
  });

  it('rejects removal when the user does not exist', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow('User not found');
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
