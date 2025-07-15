import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'allocations' })
export class Allocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  team_name: string;

  @Column()
  project_name: string;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  hours: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
