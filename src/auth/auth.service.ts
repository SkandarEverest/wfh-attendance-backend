import { Injectable, Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '@/models/user.entity';
import { LoginDto } from '@/auth/auth.dto';
import { appConfig } from '@/config/env/main.config';
import { RoleModule } from '@/models/role-module.entity';
import { getSessionTtlMilliseconds } from '@/common/helpers/helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('ROLE_MODULE_REPOSITORY')
    private readonly roleModuleRepository: Repository<RoleModule>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private async buildAllowedAccess(roleId: number): Promise<AllowedAccess[]> {
    const roleModules = await this.roleModuleRepository.find({
      where: { roleId },
      relations: { accessmodule: true },
    });

    return roleModules.map((rm) => ({
      moduleId: rm.accessmoduleId,
      moduleName: rm.accessmodule.name,
      ability: {
        view: rm.view,
        edit: rm.edit,
        delete: rm.delete,
      },
    }));
  }

  async login(loginDto: LoginDto): Promise<ServiceResponse<UserInfo | undefined>> {
    const serviceResponse: ServiceResponse<UserInfo | undefined> = {
      message: 'Login successful.',
      status: 200,
    };

    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, deletedAt: IsNull() },
      select: ['id', 'name', 'email', 'password', 'roleId'],
      relations: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const modules = await this.buildAllowedAccess(user.roleId);

    const data: UserInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name ?? '',
      modules,
    };

    data.token = await this.jwtService.signAsync(data);
    serviceResponse.data = data;

    const cacheKey = `authService:${user.id}`;
    await this.cacheManager.set(cacheKey, data.token, getSessionTtlMilliseconds(appConfig.jwtLifetime));

    return serviceResponse;
  }

  async validateToken(token: string): Promise<UserInfo> {
    const decoded: UserInfo = await this.jwtService.verifyAsync(token, {
      secret: appConfig.jwtSecret,
    });

      const cacheKey = `authService:${decoded.id}`;
      const storedToken = await this.cacheManager.get<string>(cacheKey);

      if (!storedToken) {
        throw new UnauthorizedException('Token is expired or has been revoked.');
      }

      if (storedToken !== token) {
        throw new UnauthorizedException('Logged in from another device.');
      }

      return decoded;
  }

  async logout(userId: number): Promise<void> {
    const cacheKey = `authService:${userId}`;
    await this.cacheManager.del(cacheKey);
  }

  async getProfile(userId: number): Promise<ServiceResponse<Omit<UserInfo, 'token'> | undefined>> {
    const serviceResponse: ServiceResponse<Omit<UserInfo, 'token'> | undefined> = {
      message: 'Data successfully retrieved.',
      status: 200,
    };

    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
      relations: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const modules = await this.buildAllowedAccess(user.roleId);

    serviceResponse.data = {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name ?? '',
      modules,
    };

    return serviceResponse;
  }
}
