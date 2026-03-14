import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
  HttpException,
  Header,
  Res,
  ParseFilePipe,
  UseInterceptors,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto, TimesheetPaginationQueryDto, TimesheetPhotoQueryDto } from './timesheets.dto';
import { User } from '@/common/decorators/user.decorator';
import { Timesheet } from '@/models/timesheet.entity';
import { getStatusCode } from '@/common/helpers/parser';
import { appConfig } from '@/config/env/main.config';
import { PoliciesGuard } from '@/common/guards/policies.guard';
import { CheckPolicies } from '@/common/decorators/policies.decorator';
import { Action, AppAbility } from '@/config/casl/casl-ability.factory';
import { Response } from 'express';

@ApiTags('Timesheets')
@ApiBearerAuth('jwt')
@UseGuards(PoliciesGuard)
@Controller({ path: 'timesheets', version: '1' })
export class TimesheetsController {
  constructor(private readonly service: TimesheetsService) {}

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'timesheets'))
  async getAllTimesheets(@Query() query: TimesheetPaginationQueryDto): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<Timesheet[]> = await this.service.getAllTimesheets(query);
      const result: GenericResponse = {
        success: serviceResponse.status == 200,
        ...serviceResponse
      };
      return result;
    } catch (error: any) {
      throw new HttpException(
        {
          status: getStatusCode(error),
          error: error
        },
        getStatusCode(error),
        {
          cause: error.message
        }
      );
    }
  }

  @Get('my')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'timesheets'))
  async getMyTimesheets(@User() userInfo: UserInfo, @Query() query: TimesheetPaginationQueryDto): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<Timesheet[]> = await this.service.getTimesheetsByUser(userInfo.id, query);
      const result: GenericResponse = {
        success: serviceResponse.status == 200,
        ...serviceResponse
      };
      return result;
    } catch (error: any) {
      throw new HttpException(
        {
          status: getStatusCode(error),
          error: error
        },
        getStatusCode(error),
        {
          cause: error.message
        }
      );
    }
  }

  @Get('photo')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'timesheets'))
  async getTimesheetPhotoByPath(
    @Query() query: TimesheetPhotoQueryDto,
    @User() userInfo: UserInfo,
    @Res() response: Response
  ): Promise<void> {
    try {
      const absolutePhotoPath = await this.service.getTimesheetPhotoPathByPath(query.path, userInfo);
      response.sendFile(absolutePhotoPath);
    } catch (error: any) {
      throw new HttpException(
        {
          status: getStatusCode(error),
          error: error
        },
        getStatusCode(error),
        {
          cause: error.message
        }
      );
    }
  }

  @Post('check-in')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'timesheets'))
  @Header('Content-Type', 'application/json')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed.'), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, appConfig.uploadDir),
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `checkin-${uniqueSuffix}${ext}`);
        }
      }),
      limits: {
        fileSize: appConfig.maxFileSizeMb * 1024 * 1024
      }
    })
  )
  async checkIn(
    @Body() payload: CreateTimesheetDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true
      })
    )
    photo: Express.Multer.File,
    @User() userInfo: UserInfo
  ): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<Timesheet> = await this.service.checkIn(payload, photo, userInfo);
      const result: GenericResponse = {
        success: serviceResponse.status == 201,
        ...serviceResponse
      };
      return result;
    } catch (error: any) {
      throw new HttpException(
        {
          status: getStatusCode(error),
          error: error
        },
        getStatusCode(error),
        {
          cause: error.message
        }
      );
    }
  }
}
