import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from '@/features/users/user.controller';
import { UserService } from '@/features/users/user.service';

describe('UserController', () => {
  let controller: UserController;
  const userService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('updates the authenticated user', async () => {
    await controller.update(
      1,
      { email: 'ada@example.com' },
      { userId: 1, username: 'ada', role: 'User' },
    );

    expect(userService.update).toHaveBeenCalledWith(1, {
      email: 'ada@example.com',
    });
  });

  it('forbids a non-admin from updating another user', async () => {
    await expect(
      controller.update(
        2,
        { email: 'ada@example.com' },
        { userId: 1, username: 'ada', role: 'User' },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(userService.update).not.toHaveBeenCalled();
  });

  it('lets an admin update another user', async () => {
    await controller.update(
      2,
      { email: 'bob@example.com' },
      { userId: 1, username: 'ada', role: 'Admin' },
    );

    expect(userService.update).toHaveBeenCalledWith(2, {
      email: 'bob@example.com',
    });
  });
});
