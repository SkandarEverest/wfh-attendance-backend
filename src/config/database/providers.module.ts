import { Module } from '@nestjs/common';
import { MysqlProvider } from './mysql/mysql.config';
import { MysqlRepository } from './mysql/mysql.repository';

@Module({
  providers: [MysqlProvider, ...MysqlRepository],
  exports: [MysqlProvider, ...MysqlRepository]
})
export class DatabaseModule {}
