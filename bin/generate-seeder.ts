'use strict';
import * as fs from 'fs';
import * as path from 'path';

function getTemplate(name: string) {
  return `import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { User } from '../../models/user.entity';

export default class ${name}Seeder extends Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const seedsData: Partial<User>[] = [];

    const seeds = seedsData.map((seed) => dataSource.createEntityManager().create(User, seed));

    await dataSource.createEntityManager().save<Partial<User>>(seeds);
  }
}`;
}

function generateSeeder() {
  const configPath = process.env.npm_config_path ?? 'src/database/seeders';
  const seederName = process.env.npm_config_name ?? 'Template';
  const seederPath = path.resolve(process.cwd(), configPath);
  const filename = `${seederName}.seeder.ts`;
  const filePath = path.join(seederPath, filename);
  const content = getTemplate(seederName);

  if (fs.existsSync(filePath)) {
    console.error('Seeder ' + filePath + ' existed!');
    process.exit(1);
  }

  fs.writeFile(filePath, content, (err: any) =>
    err ? console.error(err) : console.info('Seeder ' + filePath + ' has been generated successfully.')
  );
}

generateSeeder();
