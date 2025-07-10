import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkingDay } from './working-day.entity';
import { WorkingDayDto } from './dto/working-day.dto';

@Injectable()
export class WorkingDaysService {
  constructor(
    @InjectRepository(WorkingDay)
    private readonly repo: Repository<WorkingDay>,
  ) {}

  async createOrUpdate(dto: WorkingDayDto): Promise<WorkingDay> {
    const day = await this.repo.findOne({ where: { date: dto.date } });
    const entity = this.repo.merge(
      day || new WorkingDay(),
      {
        ...dto,
        day_of_week: new Date(dto.date).toLocaleDateString('en-US', {
          weekday: 'long',
        }),
      },
    );
    return this.repo.save(entity);
  }

  async replaceMonth(entries: WorkingDayDto[]): Promise<void> {
    if (entries.length === 0) return;
    const month = entries[0].date.slice(0, 7);
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('date LIKE :month', { month: `${month}-%` })
      .execute();
    for (const dto of entries) {
      await this.createOrUpdate(dto);
    }
  }
}
