import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'working_day_overrides' })
export class WorkingDayOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column({ nullable: true })
  holiday_name: string | null;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  working_hours: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
