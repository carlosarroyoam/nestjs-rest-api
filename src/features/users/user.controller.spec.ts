import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from '@/features/users/user.controller';
import { UserService } from '@/features/users/user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });
});
