import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoginDto } from '@/auth/auth.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@/models/user.entity';
import { Role } from '@/models/role.entity';
import { RoleModule } from '@/models/role-module.entity';

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
  hash: jest.fn()
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  const mockUserRepository = {
    findOne: jest.fn()
  };

  const mockRoleModuleRepository = {
    find: jest.fn()
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  };

  const mockCacheManager = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn()
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'USER_REPOSITORY', useValue: mockUserRepository },
        { provide: 'ROLE_MODULE_REPOSITORY', useValue: mockRoleModuleRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
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

  describe('login', () => {
    const role = Object.assign(new Role(), {
      id: 1,
      name: 'Admin',
      isSpecial: true,
      status: true,
      deletedAt: null
    });

    const user = Object.assign(new User(), {
      id: 1,
      name: 'Admin User',
      email: 'admin@wfh.local',
      password: '$2b$10$hashedpassword',
      roleId: 1,
      role,
      deletedAt: null
    });

    const rolemodule = Object.assign(new RoleModule(), {
      id: 1,
      roleId: 1,
      accessmoduleId: 1,
      accessmodule: { name: 'users' },
      view: true,
      edit: true,
      delete: true
    });

    it('should successfully login and return token', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(mockRoleModuleRepository, 'find').mockResolvedValue([rolemodule]);
      jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue('jwt-token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const payload: LoginDto = { email: 'admin@wfh.local', password: 'Admin12345!' };

      const result = await service.login(payload);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockRoleModuleRepository.find).toHaveBeenCalled();
      expect(mockJwtService.signAsync).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual({
        id: 1,
        name: 'Admin User',
        email: 'admin@wfh.local',
        roleId: 1,
        roleName: 'Admin',
        isSpecial: true,
        modules: [
          {
            moduleId: 1,
            moduleName: 'users',
            ability: { view: true, edit: true, delete: true }
          }
        ],
        token: 'jwt-token'
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      const payload: LoginDto = { email: 'notfound@wfh.local', password: 'password' };

      await expect(service.login(payload)).rejects.toEqual(new UnauthorizedException('Invalid credentials.'));
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const payload: LoginDto = { email: 'admin@wfh.local', password: 'wrongpass' };

      await expect(service.login(payload)).rejects.toEqual(new UnauthorizedException('Invalid credentials.'));
    });
  });

  describe('validateToken', () => {
    it('should return decoded user info for valid token', async () => {
      const decoded: UserInfo = {
        id: 1,
        name: 'Admin User',
        email: 'admin@wfh.local',
        roleId: 1,
        roleName: 'Admin',
        isSpecial: false,
        modules: []
      };

      jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(decoded);
      jest.spyOn(mockCacheManager, 'get').mockResolvedValue('valid-token');

      const result = await service.validateToken('valid-token');

      expect(mockJwtService.verifyAsync).toHaveBeenCalled();
      expect(mockCacheManager.get).toHaveBeenCalledWith('authService:1');
      expect(result).toEqual(decoded);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jest.spyOn(mockJwtService, 'verifyAsync').mockRejectedValue(new Error('invalid'));

      await expect(service.validateToken('bad-token')).rejects.toEqual(new UnauthorizedException('Unauthorized.'));
    });

    it('should throw UnauthorizedException when token is revoked', async () => {
      const decoded: UserInfo = {
        id: 1,
        name: 'Admin User',
        email: 'admin@wfh.local',
        roleId: 1,
        roleName: 'Admin',
        isSpecial: false,
        modules: []
      };

      jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(decoded);
      jest.spyOn(mockCacheManager, 'get').mockResolvedValue(null);

      await expect(service.validateToken('valid-token')).rejects.toEqual(new UnauthorizedException('Unauthorized.'));
    });

    it('should throw UnauthorizedException when token does not match active session', async () => {
      const decoded: UserInfo = {
        id: 1,
        name: 'Admin User',
        email: 'admin@wfh.local',
        roleId: 1,
        roleName: 'Admin',
        isSpecial: false,
        modules: []
      };

      jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(decoded);
      jest.spyOn(mockCacheManager, 'get').mockResolvedValue('other-token');

      await expect(service.validateToken('valid-token')).rejects.toEqual(new UnauthorizedException('Unauthorized.'));
    });
  });

  describe('logout', () => {
    it('should delete active session token from cache', async () => {
      await service.logout(10);
      expect(mockCacheManager.del).toHaveBeenCalledWith('authService:10');
    });
  });

  describe('getProfile', () => {
    const role = Object.assign(new Role(), {
      id: 1,
      name: 'Admin',
      isSpecial: true
    });

    const user = Object.assign(new User(), {
      id: 1,
      name: 'Admin User',
      email: 'admin@wfh.local',
      roleId: 1,
      role,
      deletedAt: null
    });

    const rolemodule = Object.assign(new RoleModule(), {
      id: 1,
      roleId: 1,
      accessmoduleId: 2,
      accessmodule: { name: 'timesheets' },
      view: true,
      edit: true,
      delete: false
    });

    it('should return user profile', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(mockRoleModuleRepository, 'find').mockResolvedValue([rolemodule]);

      const result = await service.getProfile(1);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockRoleModuleRepository.find).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual({
        id: 1,
        name: 'Admin User',
        email: 'admin@wfh.local',
        roleId: 1,
        roleName: 'Admin',
        isSpecial: true,
        modules: [
          {
            moduleId: 2,
            moduleName: 'timesheets',
            ability: { view: true, edit: true, delete: false }
          }
        ]
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toEqual(new NotFoundException('User not found.'));
    });
  });
});
