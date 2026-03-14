import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRolesModulesTable1741776000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles_modules',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'roleId',
            type: 'int'
          },
          {
            name: 'accessmoduleId',
            type: 'int'
          },
          {
            name: 'view',
            type: 'boolean'
          },
          {
            name: 'edit',
            type: 'boolean'
          },
          {
            name: 'delete',
            type: 'boolean'
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

    await queryRunner.createForeignKeys('roles_modules', [
      new TableForeignKey({
        name: 'FK_roles_modules_roleId',
        columnNames: ['roleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'RESTRICT'
      }),
      new TableForeignKey({
        name: 'FK_roles_modules_accessmoduleId',
        columnNames: ['accessmoduleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'modules',
        onDelete: 'RESTRICT'
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('roles_modules');
    for (const fk of table?.foreignKeys ?? []) {
      await queryRunner.dropForeignKey('roles_modules', fk);
    }
    await queryRunner.dropTable('roles_modules');
  }
}
