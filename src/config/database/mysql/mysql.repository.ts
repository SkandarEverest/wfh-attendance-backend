import { FactoryProvider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../../models/user.entity';
import { Timesheet } from '../../../models/timesheet.entity';
import { Role } from '../../../models/role.entity';
import { AccessModule } from '../../../models/module.entity';
import { RoleModule } from '../../../models/role-module.entity';

export const MysqlRepository: FactoryProvider<any>[] = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['WFH_SOURCE']
  },
  {
    provide: 'TIMESHEET_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Timesheet),
    inject: ['WFH_SOURCE']
  },
  {
    provide: 'ROLE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
    inject: ['WFH_SOURCE']
  },
  {
    provide: 'MODULE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AccessModule),
    inject: ['WFH_SOURCE']
  },
  {
    provide: 'ROLE_MODULE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RoleModule),
    inject: ['WFH_SOURCE']
  }
];
