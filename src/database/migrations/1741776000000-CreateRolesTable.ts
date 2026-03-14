import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRolesTable1741776000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            name: 'status',
            type: 'boolean',
            default: true
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
          },
          {
            name: 'deletedBy',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true
          }
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles');
  }
}
