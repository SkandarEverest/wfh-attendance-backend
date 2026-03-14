import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/config/database/providers.module';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';
import { CaslModule } from '@/config/casl/casl.module';

@Module({
  imports: [DatabaseModule, CaslModule],
  providers: [TimesheetsService],
  controllers: [TimesheetsController],
  exports: [TimesheetsService]
})
export class TimesheetsModule {}
