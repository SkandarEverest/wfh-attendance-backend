import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { IsInt, Max, Min } from 'class-validator';

export class CreateTimesheetDto {
  @ApiProperty({ example: '2024-06-15', description: 'Work date in YYYY-MM-DD format' })
  @IsNotEmpty()
  @IsDateString()
  workDate: string;

  @ApiProperty({ example: 'Working on feature X from home', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TimesheetPaginationQueryDto {
  @ApiProperty({ required: false, example: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false, example: 10, minimum: 1, maximum: 100, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size: number = 10;
}

export class TimesheetPhotoQueryDto {
  @ApiProperty({ example: 'uploads/checkin-1735365512536-18438698.jpg', description: 'Photo path from timesheet data' })
  @IsNotEmpty()
  @IsString()
  path: string;
}
