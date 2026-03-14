import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { Role } from '../../models/role.entity';

export default class RoleSeeder extends Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const baseMeta = {
      status: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedBy: 'system',
      updatedAt: new Date()
    };

    const seedsData: Partial<Role>[] = [
      { name: 'Admin', ...baseMeta },
      { name: 'Employee', ...baseMeta }
    ];

    const seeds = seedsData.map((seed) => dataSource.createEntityManager().create(Role, seed));

    await dataSource.createEntityManager().save<Partial<Role>>(seeds);
  }
}
