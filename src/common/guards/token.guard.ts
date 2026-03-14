import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest();
    const extractCookie = request.cookies?.['access_token'];
    const token: string = extractCookie ?? '';
    const allowUnauthorizedRequest = this.reflector.get<boolean>('isPublic', context.getHandler());

    if (allowUnauthorizedRequest) return true;

    if (!token) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const payload: UserInfo = await this.authService.validateToken(token);
    request.user = payload;

    return true;
  }
}
