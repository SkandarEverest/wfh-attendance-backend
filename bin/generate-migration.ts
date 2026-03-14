'use strict';
import * as childProcess from 'child_process';

function generateMigration() {
  const name = process.env.npm_config_name;

  if (!name) {
    console.error('Error: Please provide --name argument, e.g., npm run migration:create --name=MigrationName');
    process.exit(1);
  }

  const filename = `src/database/migrations/${name}`;

  const command = `npx typeorm migration:create ${filename}`;

  console.log('Running:', command);

  childProcess.execSync(command, { stdio: 'inherit' });
}

generateMigration();
