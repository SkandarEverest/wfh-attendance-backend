import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class CreateTimesheetsTable1741776000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'timesheets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'userId',
            type: 'int'
          },
          {
            name: 'workDate',
            type: 'date'
          },
          {
            name: 'checkInTime',
            type: 'timestamp'
          },
          {
            name: 'photoPath',
            type: 'varchar',
            length: '500'
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true
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
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_timesheets_userId_workDate',
            columnNames: ['userId', 'workDate']
          })
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_timesheets_userId',
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          })
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('timesheets');
  }
}
