import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { RoleModule } from '../../models/role-module.entity';
import { Role } from '../../models/role.entity';
import { AccessModule } from '../../models/module.entity';

export default class RoleModuleSeeder extends Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const roleRepo = dataSource.getRepository(Role);
    const moduleRepo = dataSource.getRepository(AccessModule);

    const adminRole = await roleRepo.findOneBy({ name: 'Admin' });
    const employeeRole = await roleRepo.findOneBy({ name: 'Employee' });
    const usersModule = await moduleRepo.findOneBy({ name: 'users' });
    const timesheetsModule = await moduleRepo.findOneBy({ name: 'timesheets' });

    if (!adminRole || !employeeRole || !usersModule || !timesheetsModule) {
      console.error('Required roles or modules not found. Run Role and Module seeders first.');
      return;
    }

    const baseMeta = {
      createdBy: 'system',
      createdAt: new Date(),
      updatedBy: 'system',
      updatedAt: new Date()
    };

    const seedsData: Partial<RoleModule>[] = [
      // Admin: full access to users
      { roleId: adminRole.id, accessmoduleId: usersModule.id, view: true, edit: true, delete: true, ...baseMeta },
      // Admin: full access to timesheets
      { roleId: adminRole.id, accessmoduleId: timesheetsModule.id, view: true, edit: true, delete: true, ...baseMeta },
      // Employee: view + create timesheets only
      {
        roleId: employeeRole.id,
        accessmoduleId: timesheetsModule.id,
        view: true,
        edit: true,
        delete: false,
        ...baseMeta
      }
    ];

    const seeds = seedsData.map((seed) => dataSource.createEntityManager().create(RoleModule, seed));

    await dataSource.createEntityManager().save<Partial<RoleModule>>(seeds);
  }
}
