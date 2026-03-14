import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Timesheet } from '@/models/timesheet.entity';
import { CreateTimesheetDto, TimesheetPaginationQueryDto } from './timesheets.dto';
import { appConfig } from '@/config/env/main.config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TimesheetsService {
  constructor(
    @Inject('TIMESHEET_REPOSITORY')
    private readonly timesheetRepository: Repository<Timesheet>
  ) {}

  async getTimesheetsByUser(
    userId: number,
    query: TimesheetPaginationQueryDto
  ): Promise<ServiceResponse<Timesheet[]>> {
    const serviceResponse: ServiceResponse<Timesheet[]> = {
      message: 'Data successfully retrieved.',
      status: 200
    };
    const page = query.page;
    const size = query.size;
    const skip = (page - 1) * size;

    const [timesheets, total] = await this.timesheetRepository.findAndCount({
      where: { userId },
      order: { workDate: 'DESC' },
      skip,
      take: size
    });

    serviceResponse.data = timesheets;
    serviceResponse.total = total;
    serviceResponse.page = page;
    serviceResponse.size = size;

    return serviceResponse;
  }

  async getAllTimesheets(query: TimesheetPaginationQueryDto): Promise<ServiceResponse<Timesheet[]>> {
    const serviceResponse: ServiceResponse<Timesheet[]> = {
      message: 'Data successfully retrieved.',
      status: 200
    };
    const page = query.page;
    const size = query.size;
    const skip = (page - 1) * size;
    const trimmedName = query.name?.trim();
    const whereCondition = trimmedName ? { user: { name: Like(`%${trimmedName}%`) } } : undefined;

    const [timesheets, total] = await this.timesheetRepository.findAndCount({
      where: whereCondition,
      relations: { user: true },
      order: { workDate: 'DESC' },
      skip,
      take: size
    });

    serviceResponse.data = timesheets;
    serviceResponse.total = total;
    serviceResponse.page = page;
    serviceResponse.size = size;

    return serviceResponse;
  }

  async checkIn(
    payload: CreateTimesheetDto,
    photo: Express.Multer.File,
    userInfo: UserInfo
  ): Promise<ServiceResponse<Timesheet>> {
    const serviceResponse: ServiceResponse<Timesheet> = {
      message: 'Check-in successful.',
      status: 201
    };

    const existing = await this.timesheetRepository.findOne({
      where: { userId: userInfo.id, workDate: payload.workDate }
    });

    if (existing) {
      throw new ConflictException('Already checked in for this date.');
    }

    if (!photo) {
      throw new BadRequestException('Photo is required for check-in.');
    }

    const photoPath = `${appConfig.uploadDir}/${photo.filename}`;

    const timesheet = new Timesheet();
    timesheet.userId = userInfo.id;
    timesheet.workDate = payload.workDate;
    timesheet.checkInTime = new Date();
    timesheet.photoPath = photoPath;
    timesheet.notes = payload.notes;
    timesheet.createdBy = userInfo.email;
    timesheet.createdAt = new Date();
    timesheet.updatedBy = userInfo.email;
    timesheet.updatedAt = new Date();

    const saved = await this.timesheetRepository.save(timesheet);
    serviceResponse.data = saved;

    return serviceResponse;
  }

  async getTimesheetPhotoPathByPath(photoPath: string, userInfo: UserInfo): Promise<string> {
    if (!photoPath) {
      throw new BadRequestException('Photo path is required.');
    }

    const whereCondition: Record<string, unknown> = { photoPath };
    if (!userInfo.isSpecial) {
      whereCondition.userId = userInfo.id;
    }

    const timesheet = await this.timesheetRepository.findOne({
      where: whereCondition
    });

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found.');
    }

    return this.resolveAndValidatePhotoPath(timesheet.photoPath);
  }

  private resolveAndValidatePhotoPath(photoPath: string): string {
    const absoluteUploadDir = path.resolve(appConfig.uploadDir);
    const absolutePhotoPath = path.resolve(photoPath);

    if (!absolutePhotoPath.startsWith(absoluteUploadDir + path.sep)) {
      throw new ForbiddenException('Access denied to photo path.');
    }

    if (!fs.existsSync(absolutePhotoPath)) {
      throw new NotFoundException('Timesheet photo not found.');
    }

    return absolutePhotoPath;
  }
}
