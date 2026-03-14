import { Test, TestingModule } from '@nestjs/testing';
import { TimesheetsController } from '@/modules/v1/timesheets/timesheets.controller';
import { TimesheetsService } from '@/modules/v1/timesheets/timesheets.service';
import { HttpException } from '@nestjs/common';
import { CaslAbilityFactory } from '@/config/casl/casl-ability.factory';

describe('TimesheetsController', () => {
  let controller: TimesheetsController;
  let module: TestingModule;

  const mockTimesheetsService = {
    getAllTimesheets: jest.fn(),
    getTimesheetsByUser: jest.fn(),
    getTimesheetById: jest.fn(),
    getTimesheetPhotoPath: jest.fn(),
    checkIn: jest.fn()
  };

  const mockCaslAbilityFactory = {
    createForUser: jest.fn()
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        TimesheetsController,
        { provide: TimesheetsService, useValue: mockTimesheetsService },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory }
      ]
    }).compile();

    controller = module.get<TimesheetsController>(TimesheetsController);
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

  describe('getAllTimesheets', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Data successfully retrieved.',
        status: 200,
        data: [],
        total: 0,
        page: 1,
        size: 10
      };
      const query = { page: 1, size: 10 };

      jest.spyOn(mockTimesheetsService, 'getAllTimesheets').mockReturnValue(response);

      const result = await controller.getAllTimesheets(query);

      expect(mockTimesheetsService.getAllTimesheets).toHaveBeenCalledWith(query);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockTimesheetsService, 'getAllTimesheets').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.getAllTimesheets({ page: 1, size: 10 })).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('getMyTimesheets', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Data successfully retrieved.',
        status: 200,
        data: [],
        total: 0,
        page: 1,
        size: 10
      };
      const query = { page: 1, size: 10 };

      jest.spyOn(mockTimesheetsService, 'getTimesheetsByUser').mockReturnValue(response);

      const result = await controller.getMyTimesheets(userInfo, query);

      expect(mockTimesheetsService.getTimesheetsByUser).toHaveBeenCalledWith(1, query);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockTimesheetsService, 'getTimesheetsByUser').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.getMyTimesheets(userInfo, { page: 1, size: 10 })).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('getTimesheetPhoto', () => {
    it('should send timesheet photo file', async () => {
      const response = { sendFile: jest.fn() } as any;

      jest.spyOn(mockTimesheetsService, 'getTimesheetPhotoPath').mockResolvedValue('/tmp/photo.jpg');

      await controller.getTimesheetPhoto(1, userInfo, response);

      expect(mockTimesheetsService.getTimesheetPhotoPath).toHaveBeenCalledWith(1, userInfo);
      expect(response.sendFile).toHaveBeenCalledWith('/tmp/photo.jpg');
    });

    it('should throw error response', async () => {
      jest.spyOn(mockTimesheetsService, 'getTimesheetPhotoPath').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.getTimesheetPhoto(1, userInfo, { sendFile: jest.fn() } as any)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('getTimesheetById', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Data successfully retrieved.',
        status: 200,
        data: { id: 1, userId: 1 }
      };

      jest.spyOn(mockTimesheetsService, 'getTimesheetById').mockReturnValue(response);

      const result = await controller.getTimesheetById(1, userInfo);

      expect(mockTimesheetsService.getTimesheetById).toHaveBeenCalledWith(1, userInfo);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockTimesheetsService, 'getTimesheetById').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(controller.getTimesheetById(999, userInfo)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });

  describe('checkIn', () => {
    it('should return successful response', async () => {
      const response = {
        message: 'Check-in successful.',
        status: 201,
        data: { id: 1 }
      };

      jest.spyOn(mockTimesheetsService, 'checkIn').mockReturnValue(response);

      const payload = { workDate: '2024-06-15' };
      const photo = { filename: 'test.jpg' } as Express.Multer.File;

      const result = await controller.checkIn(payload, photo, userInfo);

      expect(mockTimesheetsService.checkIn).toHaveBeenCalledWith(payload, photo, userInfo);
      expect(result).toEqual({ success: true, ...response });
    });

    it('should throw error response', async () => {
      jest.spyOn(mockTimesheetsService, 'checkIn').mockImplementation(() => {
        throw new Error('error');
      });

      const payload = { workDate: '2024-06-15' };
      const photo = { filename: 'test.jpg' } as Express.Multer.File;

      await expect(controller.checkIn(payload, photo, userInfo)).rejects.toEqual(
        new HttpException({ status: 500, error: Error('error') }, 500, { cause: 'error' })
      );
    });
  });
});
