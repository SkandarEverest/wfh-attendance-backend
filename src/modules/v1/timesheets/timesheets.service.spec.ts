import { Test, TestingModule } from '@nestjs/testing';
import { TimesheetsService } from '@/modules/v1/timesheets/timesheets.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
    modules: []
  };

  const employeeInfo: UserInfo = {
    id: 2,
    name: 'Employee',
    email: 'emp@wfh.local',
    roleId: 2,
    roleName: 'Employee',
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

  describe('getTimesheetById', () => {
    it('should return timesheet by id (Admin)', async () => {
      const timesheet = Object.assign(new Timesheet(), { id: 1, userId: 2, workDate: '2024-06-15' });

      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(timesheet);

      const result = await service.getTimesheetById(1, userInfo);

      expect(mockTimesheetRepository.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
      expect(result.status).toBe(200);
      expect(result.data).toEqual(timesheet);
    });

    it('should filter by userId for non-Admin', async () => {
      const timesheet = Object.assign(new Timesheet(), { id: 1, userId: 2, workDate: '2024-06-15' });

      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(timesheet);

      const result = await service.getTimesheetById(1, employeeInfo);

      expect(mockTimesheetRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1, userId: 2 } })
      );
      expect(result.status).toBe(200);
    });

    it('should throw NotFoundException when timesheet not found', async () => {
      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getTimesheetById(999, userInfo)).rejects.toEqual(
        new NotFoundException('Timesheet not found.')
      );
    });
  });

  describe('getTimesheetPhotoPath', () => {
    it('should return absolute photo path', async () => {
      const uploadDir = path.resolve('uploads');
      const filePath = path.resolve(uploadDir, 'photo.jpg');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(filePath, 'test');

      const timesheet = Object.assign(new Timesheet(), {
        id: 1,
        userId: 1,
        photoPath: 'uploads/photo.jpg'
      });

      jest.spyOn(mockTimesheetRepository, 'findOne').mockResolvedValue(timesheet);

      const result = await service.getTimesheetPhotoPath(1, userInfo);

      expect(result).toEqual(filePath);
      fs.unlinkSync(filePath);
    });
  });
});
