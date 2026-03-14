import { Test, TestingModule } from '@nestjs/testing';
import { TimesheetsService } from '@/modules/v1/timesheets/timesheets.service';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Timesheet } from '@/models/timesheet.entity';
import * as fs from 'fs';
import * as path from 'path';

describe('TimesheetsService', () => {
  let service: TimesheetsService;
  let module: TestingModule;

  const mockTimesheetRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn()
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [TimesheetsService, { provide: 'TIMESHEET_REPOSITORY', useValue: mockTimesheetRepository }]
    }).compile();

    service = module.get<TimesheetsService>(TimesheetsService);
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
    isSpecial: true,
    modules: []
  };

  const employeeInfo: UserInfo = {
    id: 2,
    name: 'Employee',
    email: 'emp@wfh.local',
    roleId: 2,
    roleName: 'Employee',
    isSpecial: false,
    modules: []
  };

  describe('getTimesheetsByUser', () => {
    it('should return timesheets for a user', async () => {
      const timesheets = [
        Object.assign(new Timesheet(), { id: 1, userId: 1, workDate: '2024-06-15' }),
        Object.assign(new Timesheet(), { id: 2, userId: 1, workDate: '2024-06-14' })
      ];
      const query = { page: 1, size: 10 };

      jest.spyOn(mockTimesheetRepository, 'findAndCount').mockResolvedValue([timesheets, timesheets.length]);

      const result = await service.getTimesheetsByUser(1, query);

      expect(mockTimesheetRepository.findAndCount).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual(timesheets);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });
  });

  describe('getAllTimesheets', () => {
    it('should return all timesheets', async () => {
      const timesheets = [Object.assign(new Timesheet(), { id: 1, userId: 1, workDate: '2024-06-15' })];
      const query = { page: 1, size: 10 };

      jest.spyOn(mockTimesheetRepository, 'findAndCount').mockResolvedValue([timesheets, timesheets.length]);

      const result = await service.getAllTimesheets(query);

      expect(mockTimesheetRepository.findAndCount).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual(timesheets);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });
  });

  describe('checkIn', () => {
    const payload = { workDate: '2024-06-15' };

    const mockPhoto = {
      filename: 'checkin-123.jpg',
      originalname: 'photo.jpg'
    } as Express.Multer.File;

    it('should successfully check in', async () => {
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(null);

      const savedTimesheet = Object.assign(new Timesheet(), {
        id: 1,
        userId: 1,
        workDate: '2024-06-15',
        photoPath: 'uploads/checkin-123.jpg'
      });
      jest.spyOn(mockTimesheetRepository, 'save').mockResolvedValue(savedTimesheet);

      const result = await service.checkIn(payload, mockPhoto, userInfo);

      expect(mockTimesheetRepository.findOne).toHaveBeenCalled();
      expect(mockTimesheetRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(201);
      expect(result.data).toEqual(savedTimesheet);
    });

    it('should throw ConflictException when already checked in', async () => {
      const existing = Object.assign(new Timesheet(), { id: 1, userId: 1, workDate: '2024-06-15' });
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(existing);

      await expect(service.checkIn(payload, mockPhoto, userInfo)).rejects.toEqual(
        new ConflictException('Already checked in for this date.')
      );
    });

    it('should throw BadRequestException when no photo provided', async () => {
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(null);

      await expect(service.checkIn(payload, null as any, userInfo)).rejects.toEqual(
        new BadRequestException('Photo is required for check-in.')
      );
    });
  });

  describe('getTimesheetPhotoPathByPath', () => {
    it('should return absolute photo path for special user', async () => {
      const uploadDir = path.resolve('uploads');
      const filePath = path.resolve(uploadDir, 'photo-special.jpg');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(filePath, 'test');

      const timesheet = Object.assign(new Timesheet(), {
        id: 1,
        userId: 2,
        photoPath: 'uploads/photo-special.jpg'
      });
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(timesheet);

      const result = await service.getTimesheetPhotoPathByPath('uploads/photo-special.jpg', userInfo);

      expect(mockTimesheetRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { photoPath: 'uploads/photo-special.jpg' } })
      );
      expect(result).toEqual(filePath);
      fs.unlinkSync(filePath);
    });

    it('should filter by userId for non-special user', async () => {
      const uploadDir = path.resolve('uploads');
      const filePath = path.resolve(uploadDir, 'photo-employee.jpg');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(filePath, 'test');

      const timesheet = Object.assign(new Timesheet(), {
        id: 2,
        userId: 2,
        photoPath: 'uploads/photo-employee.jpg'
      });
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(timesheet);

      const result = await service.getTimesheetPhotoPathByPath('uploads/photo-employee.jpg', employeeInfo);

      expect(mockTimesheetRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { photoPath: 'uploads/photo-employee.jpg', userId: 2 } })
      );
      expect(result).toEqual(filePath);
      fs.unlinkSync(filePath);
    });

    it('should throw BadRequestException when photo path is empty', async () => {
      await expect(service.getTimesheetPhotoPathByPath('', userInfo)).rejects.toEqual(
        new BadRequestException('Photo path is required.')
      );
    });

    it('should throw NotFoundException when timesheet not found', async () => {
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getTimesheetPhotoPathByPath('uploads/missing.jpg', employeeInfo)).rejects.toEqual(
        new NotFoundException('Timesheet not found.')
      );
    });

    it('should throw ForbiddenException for invalid resolved path', async () => {
      const timesheet = Object.assign(new Timesheet(), {
        id: 3,
        userId: 2,
        photoPath: '../outside.jpg'
      });
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(timesheet);

      await expect(service.getTimesheetPhotoPathByPath('../outside.jpg', userInfo)).rejects.toEqual(
        new ForbiddenException('Access denied to photo path.')
      );
    });
  });
});
