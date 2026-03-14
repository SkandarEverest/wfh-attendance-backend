import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateModulesTable1741776000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'modules',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100'
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '100'
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updatedBy',
            type: 'varchar',
            length: '100'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            isNullable: true,
            default: 'now()'
          }
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('modules');
  }
}
