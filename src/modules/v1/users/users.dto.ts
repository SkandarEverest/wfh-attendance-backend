import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { IsInt, Max, Min } from 'class-validator';
import { User } from '@/models/user.entity';
import { transformIntoNumber } from '@/common/decorators/transform.decorator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@wfh.local' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 1, description: 'Role ID' })
  @IsNotEmpty()
  @Transform(transformIntoNumber)
  @IsNumber()
  roleId: number;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john@wfh.local', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 1, description: 'Role ID', required: false })
  @IsOptional()
  @IsNumber()
  roleId?: number;
}

export class UserPaginationQueryDto {
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
