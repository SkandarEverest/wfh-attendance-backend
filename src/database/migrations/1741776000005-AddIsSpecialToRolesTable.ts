import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsSpecialToRolesTable1741776000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usersHasIsSpecial = await queryRunner.hasColumn('users', 'isSpecial');
    if (usersHasIsSpecial) {
      await queryRunner.dropColumn('users', 'isSpecial');
    }

    await queryRunner.addColumn(
      'roles',
      new TableColumn({
        name: 'isSpecial',
        type: 'boolean',
        isNullable: false,
        default: false
      })
    );

    await queryRunner.query('UPDATE roles SET isSpecial = false WHERE isSpecial IS NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('roles', 'isSpecial');
  }
}
