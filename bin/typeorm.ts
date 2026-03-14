import { DataSource } from 'typeorm';
import { mysqlConfig } from '../src/config/database/mysql/mysql.config';

export const dataSource = new DataSource({
  ...mysqlConfig,
});
