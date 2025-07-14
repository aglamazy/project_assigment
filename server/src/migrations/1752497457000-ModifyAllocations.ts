import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAllocationsWithDateRange1752497457000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('allocations', true);

        await queryRunner.createTable(
            new Table({
                name: 'allocations',
                columns: [
                    {
                        name: 'id',
                        type: 'uniqueidentifier',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'NEWID()',
                    },
                    {
                        name: 'team_name',
                        type: 'varchar',
                    },
                    {
                        name: 'project_name',
                        type: 'varchar',
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                    },
                    {
                        name: 'hours',
                        type: 'decimal',
                        precision: 4,
                        scale: 2,
                        isNullable: true, // null means full day
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
        await queryRunner.dropTable('allocations');
    }
}
