import { join } from 'path';
import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { User } from '../../../models/user.entity';
import { Timesheet } from '../../../models/timesheet.entity';
import { Role } from '../../../models/role.entity';
import { AccessModule } from '../../../models/module.entity';
import { RoleModule } from '../../../models/role-module.entity';
import { moduleConfig, appConfig } from '../../env/main.config';

export const mysqlConfig: MysqlConnectionOptions & { seeds: string[] } = {
  type: 'mysql',
  name: 'WFH_ATTENDANCE',
  host: moduleConfig.databaseHost,
  port: moduleConfig.databasePort,
  username: moduleConfig.databaseUsername,
  password: moduleConfig.databasePassword,
  database: moduleConfig.databaseName,
  logging: appConfig.environment === 'local',
  entities: [User, Timesheet, Role, AccessModule, RoleModule],
  migrations: [join(__dirname, '../../../database/migrations/*.{ts,js}')],
  seeds: [join(__dirname, '../../../database/seeders/*.{ts,js}')]
};

export const MysqlProvider = {
  provide: 'WFH_SOURCE',
  useFactory: async (): Promise<DataSource> => {
    const dataSource = await new DataSource({
      ...mysqlConfig,
      host: moduleConfig.databaseHost,
      port: moduleConfig.databasePort,
      username: moduleConfig.databaseUsername,
      password: moduleConfig.databasePassword,
      database: moduleConfig.databaseName
    }).initialize();

    return dataSource;
  }
};
