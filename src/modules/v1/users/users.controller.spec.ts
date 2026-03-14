import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@/modules/v1/users/users.controller';
import { UsersService } from '@/modules/v1/users/users.service';
import { HttpException } from '@nestjs/common';
import { CaslAbilityFactory } from '@/config/casl/casl-ability.factory';

describe('UsersController', () => {
  let controller: UsersController;
  let module: TestingModule;

  const mockUsersService = {
    getUsers: jest.fn(),
    getRoles: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  };

  const mockCaslAbilityFactory = {
    createForUser: jest.fn()
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersController,
        { provide: UsersService, useValue: mockUsersService },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
    await module.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const userInfo: UserInfo = {
    id: 1,
    name: 'Admin User',
    email: 'admin@wfh.local',
    roleId: 1,
    roleName: 'Admin',
    modules: []
  };

  describe('getRoles', () => {
    it('should return successful response', async () => {
      // arrange
      const response = {
        message: 'Data successfully retrieved.',
        status: 200,
        data: [{ id: 1, name: 'Admin' }],
        total: 1
      };

      jest.spyOn(mockUsersService, 'getRoles').mockReturnValue(response);

      // act
      const result = await controller.getRoles();

      // assert
      expect(mockUsersService.getRoles).toHaveBeenCalled();
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockUsersService, 'getRoles').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.getRoles()).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('getUsers', () => {
    it('should return successful response', async () => {
      // arrange
      const response = {
        message: 'Data successfully retrieved.',
        status: 200,
        data: [],
        total: 0,
        page: 1,
        size: 10
      };
      const query = { page: 1, size: 10 };

      jest.spyOn(mockUsersService, 'getUsers').mockReturnValue(response);

      // act
      const result = await controller.getUsers(query);

      // assert
      expect(mockUsersService.getUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockUsersService, 'getUsers').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.getUsers({ page: 1, size: 10 })).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('getUserById', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Data successfully retrieved.',
        status: 200,
        data: { id: 1, name: 'Admin User' }
      };

      jest.spyOn(mockUsersService, 'getUserById').mockReturnValue(response);

      const result = await controller.getUserById(1);

      expect(mockUsersService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockUsersService, 'getUserById').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.getUserById(999)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('createUser', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Data successfully created.',
        status: 201,
        data: { id: 3, name: 'New User' }
      };

      jest.spyOn(mockUsersService, 'createUser').mockReturnValue(response);

      const payload = { name: 'New User', email: 'new@wfh.local', password: 'Pass123!', roleId: 2 };

      const result = await controller.createUser(payload, userInfo);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(payload, userInfo);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockUsersService, 'createUser').mockImplementation(() => {
        throw new Error('error');
      });

      const payload = { name: 'New User', email: 'new@wfh.local', password: 'Pass123!', roleId: 2 };

      await expect(controller.createUser(payload, userInfo)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('updateUser', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Data successfully updated.',
        status: 200,
        data: { id: 1, name: 'Updated Name' }
      };

      jest.spyOn(mockUsersService, 'updateUser').mockReturnValue(response);

      const payload = { name: 'Updated Name' };

      const result = await controller.updateUser(1, payload, userInfo);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(1, payload, userInfo);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockUsersService, 'updateUser').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.updateUser(1, { name: 'test' }, userInfo)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('deleteUser', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Data successfully deleted.',
        status: 200
      };

      jest.spyOn(mockUsersService, 'deleteUser').mockReturnValue(response);

      const result = await controller.deleteUser(1, userInfo);

      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(1, userInfo);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockUsersService, 'deleteUser').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.deleteUser(1, userInfo)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });
});
