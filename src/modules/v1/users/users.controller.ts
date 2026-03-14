import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  Header,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserPaginationQueryDto } from './users.dto';
import { User as UserDecorator } from '@/common/decorators/user.decorator';
import { User } from '@/models/user.entity';
import { Role } from '@/models/role.entity';
import { getStatusCode } from '@/common/helpers/parser';
import { PoliciesGuard } from '@/common/guards/policies.guard';
import { CheckPolicies } from '@/common/decorators/policies.decorator';
import { Action, AppAbility } from '@/config/casl/casl-ability.factory';

@ApiTags('Users')
@ApiBearerAuth('jwt')
@UseGuards(PoliciesGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('roles')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'users'))
  async getRoles(): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<Role[]> = await this.service.getRoles();
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

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'users'))
  async getUsers(@Query() query: UserPaginationQueryDto): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<User[]> = await this.service.getUsers(query);
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

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'users'))
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<User> = await this.service.getUserById(id);
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

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'users'))
  @Header('Content-Type', 'application/json')
  async createUser(@Body() payload: CreateUserDto, @UserDecorator() userInfo: UserInfo): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<User> = await this.service.createUser(payload, userInfo);
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

  @Put(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'users'))
  @Header('Content-Type', 'application/json')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserDto,
    @UserDecorator() userInfo: UserInfo
  ): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<User> = await this.service.updateUser(id, payload, userInfo);
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

  @Patch('delete/:id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'users'))
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() userInfo: UserInfo
  ): Promise<GenericResponse> {
    try {
      const serviceResponse: ServiceResponse<any> = await this.service.deleteUser(id, userInfo);
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
}
