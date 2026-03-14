import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/config/database/providers.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CaslModule } from '@/config/casl/casl.module';

@Module({
  imports: [DatabaseModule, CaslModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
