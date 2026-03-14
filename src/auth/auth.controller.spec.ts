import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { LoginDto } from '@/auth/auth.dto';
import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;

  const mockAuthService = {
    login: jest.fn(),
    getProfile: jest.fn(),
    validateToken: jest.fn(),
    logout: jest.fn()
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthController,
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
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

  const mockResponse = () => {
    const res: Partial<Response> = {
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
    return res as Response;
  };

  describe('login', () => {
    it('should return successful response', async () => {
      // arrange
      const response = {
        message: 'Login successful.',
        status: 200,
        data: {
          id: 1,
          name: 'Admin User',
          email: 'admin@wfh.local',
          roleId: 1,
          roleName: 'Admin',
          isSpecial: true,
          modules: [],
          token: 'jwt-token'
        }
      };

      jest.spyOn(mockAuthService, 'login').mockReturnValue(response);

      const credential = {} as LoginDto;
      const res = mockResponse();

      // act
      const result = await controller.login(credential, res);

      // assert
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'jwt-token', expect.any(Object));
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should throw error response', async () => {
      // arrange
      jest.spyOn(mockAuthService, 'login').mockImplementation(() => {
        throw new Error('error');
      });

      const credential = {} as LoginDto;

      // act and assert
      await expect(controller.login(credential, {} as Response)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('logout', () => {
    it('should return successful response', async () => {
      const res = mockResponse();
      const req = {
        cookies: {
          access_token: 'token'
        }
      } as unknown as Request;

      jest.spyOn(mockAuthService, 'validateToken').mockResolvedValue({ id: 1 } as UserInfo);
      jest.spyOn(mockAuthService, 'logout').mockResolvedValue(undefined);

      const result = await controller.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockAuthService.validateToken).toHaveBeenCalledWith('token');
      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        message: 'Logout successful.',
        status: 200
      });
    });
  });

  describe('profile', () => {
    it('should return successful response', async () => {
      // arrange
      const response = {
        message: 'Data successfully retrieved.',
        status: 200,
        data: {
          id: 1,
          name: 'Admin User',
          email: 'admin@wfh.local',
          roleId: 1,
          roleName: 'Admin',
          isSpecial: true,
          modules: []
        }
      };

      jest.spyOn(mockAuthService, 'getProfile').mockReturnValue(response);

      const userInfo = { id: 1 } as UserInfo;

      // act
      const result = await controller.profile(userInfo);

      // assert
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should throw error response', async () => {
      // arrange
      jest.spyOn(mockAuthService, 'getProfile').mockImplementation(() => {
        throw new Error('error');
      });

      const userInfo = { id: 1 } as UserInfo;

      // act and assert
      await expect(controller.profile(userInfo)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });
});
