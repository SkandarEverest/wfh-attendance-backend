import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/modules/v1/users/users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { User } from '@/models/user.entity';
import { Role } from '@/models/role.entity';

describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;

  const mockUserRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn()
  };

  const mockRoleRepository = {
    find: jest.fn()
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'USER_REPOSITORY', useValue: mockUserRepository },
        { provide: 'ROLE_REPOSITORY', useValue: mockRoleRepository }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
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
    expect(service).toBeDefined();
  });

  const userInfo: UserInfo = {
    id: 1,
    name: 'Admin User',
    email: 'admin@wfh.local',
    roleId: 1,
    roleName: 'Admin',
    modules: []
  };

  describe('getUsers', () => {
    it('should return list of users', async () => {
      const users = [
        Object.assign(new User(), {
          id: 1,
          name: 'Admin User',
          email: 'admin@wfh.local',
          role: Object.assign(new Role(), { id: 1, name: 'Admin' })
        }),
        Object.assign(new User(), {
          id: 2,
          name: 'Employee',
          email: 'emp@wfh.local',
          role: Object.assign(new Role(), { id: 2, name: 'Employee' })
        })
      ];
      const query = { page: 1, size: 10 };

      jest.spyOn(mockUserRepository, 'findAndCount').mockResolvedValue([users, users.length]);

      const result = await service.getUsers(query);

      expect(mockUserRepository.findAndCount).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual([
        { ...users[0], roleName: 'Admin' },
        { ...users[1], roleName: 'Employee' }
      ]);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });
  });

  describe('getRoles', () => {
    it('should return list of active roles', async () => {
      const roles = [
        Object.assign(new Role(), { id: 1, name: 'Admin', status: true }),
        Object.assign(new Role(), { id: 2, name: 'Employee', status: true })
      ];

      jest.spyOn(mockRoleRepository, 'find').mockResolvedValue(roles);

      const result = await service.getRoles();

      expect(mockRoleRepository.find).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual(roles);
      expect(result.total).toBe(2);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = Object.assign(new User(), { id: 1, name: 'Admin User', email: 'admin@wfh.local' });

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      const result = await service.getUserById(1);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserById(999)).rejects.toEqual(new NotFoundException('User not found.'));
    });
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      const savedUser = Object.assign(new User(), {
        id: 3,
        name: 'New User',
        email: 'new@wfh.local',
        roleId: 2
      });
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(savedUser);

      const payload = { name: 'New User', email: 'new@wfh.local', password: 'Pass123!', roleId: 2 };

      const result = await service.createUser(payload, userInfo);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(201);
      expect(result.data).toEqual(savedUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      const existing = Object.assign(new User(), { id: 1, email: 'existing@wfh.local' });
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(existing);

      const payload = { name: 'Dup User', email: 'existing@wfh.local', password: 'Pass123!', roleId: 2 };

      await expect(service.createUser(payload, userInfo)).rejects.toEqual(
        new ConflictException('Email already registered.')
      );
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const user = Object.assign(new User(), { id: 1, name: 'Old Name', email: 'admin@wfh.local', roleId: 1 });
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      const updatedUser = Object.assign(new User(), { ...user, name: 'New Name' });
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(updatedUser);

      const payload = { name: 'New Name' };

      const result = await service.updateUser(1, payload, userInfo);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateUser(999, { name: 'test' }, userInfo)).rejects.toEqual(
        new NotFoundException('User not found.')
      );
    });
  });

  describe('deleteUser', () => {
    it('should successfully soft-delete a user', async () => {
      const user = Object.assign(new User(), { id: 1, name: 'Admin User', email: 'admin@wfh.local' });
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(user);

      const result = await service.deleteUser(1, userInfo);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.message).toBe('Data successfully deleted.');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteUser(999, userInfo)).rejects.toEqual(new NotFoundException('User not found.'));
    });
  });
});
