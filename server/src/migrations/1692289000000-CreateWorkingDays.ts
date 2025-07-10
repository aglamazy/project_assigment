import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWorkingDays1692289000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'working_days',
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
            name: 'day_of_week',
            type: 'varchar',
          },
          {
            name: 'working_hours',
            type: 'decimal',
            precision: 4,
            scale: 2,
          },
          {
            name: 'is_holiday',
            type: 'bit',
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
    await queryRunner.dropTable('working_days');
  }
}
