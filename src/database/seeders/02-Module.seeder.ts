import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { AccessModule } from '../../models/module.entity';

export default class ModuleSeeder extends Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const baseMeta = {
      createdBy: 'system',
      createdAt: new Date(),
      updatedBy: 'system',
      updatedAt: new Date()
    };

    const seedsData: Partial<AccessModule>[] = [
      { name: 'users', ...baseMeta },
      { name: 'timesheets', ...baseMeta }
    ];

    const seeds = seedsData.map((seed) => dataSource.createEntityManager().create(AccessModule, seed));

    await dataSource.createEntityManager().save<Partial<AccessModule>>(seeds);
  }
}
