import { Controller, Post, Get, Body, HttpException, Header, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { LoginDto } from '@/auth/auth.dto';
import { getStatusCode } from '@/common/helpers/parser';
import { Public } from '@/common/decorators/public.decorator';
import { User } from '@/common/decorators/user.decorator';
import { Request, Response } from 'express';
import { appConfig } from '@/config/env/main.config';
import { getSessionTtlMilliseconds } from '@/common/helpers/helper';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post()
  @Header('Content-Type', 'application/json')
  async login(@Body() credential: LoginDto, @Res({ passthrough: true }) response: Response): Promise<GenericResponse> {
    try {
      const serviceResponse = await this.service.login(credential);
      const result: GenericResponse = {
        success: serviceResponse.status == 200,
        ...serviceResponse,
      };
      response.cookie('access_token', serviceResponse.data?.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: getSessionTtlMilliseconds(appConfig.jwtLifetime),
      });
      delete serviceResponse.data?.token;
      return result;
    } catch (error: any) {
      throw new HttpException(
        {
          status: getStatusCode(error),
          error: error,
        },
        getStatusCode(error),
        {
          cause: error.message,
        },
      );
    }
  }

  @Public()
  @Post('logout')
  @Header('Content-Type', 'application/json')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<GenericResponse> {
    try {
      const token: string = request.cookies?.['access_token'] ?? '';
      if (token) {
        try {
          const decoded = await this.service.validateToken(token);
          await this.service.logout(decoded.id);
        } catch {
          // Ignore decode failures and still clear client cookie.
        }
      }

      const result: GenericResponse = {
        success: true,
        message: 'Logout successful.',
        status: 200,
      };
      response.clearCookie('access_token');
      return result;
    } catch (error: any) {
      throw new HttpException(
        {
          status: getStatusCode(error),
          error: error,
        },
        getStatusCode(error),
        {
          cause: error.message,
        },
      );
    }
  }

  @Get('profile')
  @Header('Content-Type', 'application/json')
  async profile(@User() user: UserInfo): Promise<GenericResponse> {
    try {
      const serviceResponse = await this.service.getProfile(user.id);
      const result: GenericResponse = {
        success: serviceResponse.status == 200,
        ...serviceResponse,
      };
      return result;
    } catch (error: any) {
      throw new HttpException(
        {
          status: getStatusCode(error),
          error: error,
        },
        getStatusCode(error),
        {
          cause: error.message,
        },
      );
    }
  }
}
