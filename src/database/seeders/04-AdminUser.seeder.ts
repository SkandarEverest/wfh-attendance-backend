import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import * as bcrypt from 'bcrypt';
import { User } from '../../models/user.entity';
import { Role } from '../../models/role.entity';

export default class AdminUserSeeder extends Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@wfh.local';
    const name = process.env.DEFAULT_ADMIN_NAME || 'Administrator';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'password';

    const existing = await dataSource.getRepository(User).findOne({ where: { email } });

    if (existing) {
      console.log(`Admin user already exists: ${email}`);
      return;
    }

    const adminRole = await dataSource.getRepository(Role).findOneBy({ name: 'Admin' });

    if (!adminRole) {
      console.error('Admin role not found. Run Role seeder first.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seedsData: Partial<User>[] = [
      {
        name,
        email,
        password: hashedPassword,
        roleId: adminRole.id,
        createdBy: 'system',
        createdAt: new Date(),
        updatedBy: 'system',
        updatedAt: new Date()
      }
    ];

    const seeds = seedsData.map((seed) => dataSource.createEntityManager().create(User, seed));

    await dataSource.createEntityManager().save<Partial<User>>(seeds);
    console.log(`Admin user created: ${email}`);
  }
}
