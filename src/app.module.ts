import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/modules/v1/users/users.module';
import { TimesheetsModule } from '@/modules/v1/timesheets/timesheets.module';

@Module({
  imports: [AuthModule, UsersModule, TimesheetsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
