import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/models/user.entity';
import { Role } from '@/models/role.entity';
import { CreateUserDto, UpdateUserDto, UserPaginationQueryDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY')
    private readonly roleRepository: Repository<Role>
  ) {}

  async getUsers(query: UserPaginationQueryDto): Promise<ServiceResponse<User[]>> {
    const serviceResponse: ServiceResponse<User[]> = {
      message: 'Data successfully retrieved.',
      status: 200
    };
    const page = query.page;
    const size = query.size;
    const skip = (page - 1) * size;

    const [users, total] = await this.userRepository.findAndCount({
      where: { deletedAt: IsNull() },
      relations: { role: true },
      order: { createdAt: 'DESC' },
      skip,
      take: size
    });

    serviceResponse.data = users;
    serviceResponse.total = total;
    serviceResponse.page = page;
    serviceResponse.size = size;

    return serviceResponse;
  }

  async getRoles(): Promise<ServiceResponse<Role[]>> {
    const serviceResponse: ServiceResponse<Role[]> = {
      message: 'Data successfully retrieved.',
      status: 200
    };

    const roles = await this.roleRepository.find({
      where: { deletedAt: IsNull(), status: true },
      order: { id: 'ASC' }
    });

    serviceResponse.data = roles;
    serviceResponse.total = roles.length;

    return serviceResponse;
  }

  async getUserById(id: number): Promise<ServiceResponse<User>> {
    const serviceResponse: ServiceResponse<User> = {
      message: 'Data successfully retrieved.',
      status: 200
    };

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() }
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    serviceResponse.data = user;

    return serviceResponse;
  }

  async createUser(payload: CreateUserDto, userInfo: UserInfo): Promise<ServiceResponse<User>> {
    const serviceResponse: ServiceResponse<User> = {
      message: 'Data successfully created.',
      status: 201
    };

    const existing = await this.userRepository.findOne({
      where: { email: payload.email, deletedAt: IsNull() }
    });

    if (existing) {
      throw new ConflictException('Email already registered.');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = new User();
    user.name = payload.name;
    user.email = payload.email;
    user.password = hashedPassword;
    user.roleId = payload.roleId;
    user.createdBy = userInfo.email;
    user.createdAt = new Date();
    user.updatedBy = userInfo.email;
    user.updatedAt = new Date();

    const saved = await this.userRepository.save(user);
    serviceResponse.data = saved;

    return serviceResponse;
  }

  async updateUser(id: number, payload: UpdateUserDto, userInfo: UserInfo): Promise<ServiceResponse<User>> {
    const serviceResponse: ServiceResponse<User> = {
      message: 'Data successfully updated.',
      status: 200
    };

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() }
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email;
    if (payload.roleId) user.roleId = payload.roleId;
    user.updatedBy = userInfo.email;
    user.updatedAt = new Date();

    const saved = await this.userRepository.save(user);
    serviceResponse.data = saved;

    return serviceResponse;
  }

  async deleteUser(id: number, userInfo: UserInfo): Promise<ServiceResponse<any>> {
    const serviceResponse: ServiceResponse<any> = {
      message: 'Data successfully deleted.',
      status: 200
    };

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() }
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.deletedBy = userInfo.email;
    user.deletedAt = new Date();
    user.updatedBy = userInfo.email;
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    return serviceResponse;
  }
}
