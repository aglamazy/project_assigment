import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'working_days' })
export class WorkingDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column()
  day_of_week: string;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  working_hours: number;

  @Column({ type: 'bit' })
  is_holiday: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
