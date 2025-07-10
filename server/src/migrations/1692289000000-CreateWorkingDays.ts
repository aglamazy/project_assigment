import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWorkingDayOverrides1692289000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
        new Table({
          name: 'working_day_overrides',
          columns: [
            {
              name: 'id',
              type: 'uniqueidentifier',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'NEWID()',
            },
            {
              name: 'date',
              type: 'date',
              isUnique: true,
            },
            {
              name: 'holiday_name',
              type: 'varchar',
              isNullable: true, // null for non-holiday overrides (e.g., reduced hours)
            },
            {
              name: 'working_hours',
              type: 'decimal',
              precision: 4,
              scale: 2,
              isNullable: false, // always required to override default
            },
            {
              name: 'created_at',
              type: 'datetime',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'datetime',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('working_day_overrides');
  }
}
