import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkingDayOverride } from './working-day-override.entity';

@Injectable()
export class GlobalsService {
  constructor(
    @InjectRepository(WorkingDayOverride)
    private readonly overridesRepo: Repository<WorkingDayOverride>,
  ) {}

  async getWorkingDays(year: number, month: number): Promise<number[]> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month - 1, daysInMonth);
    const startIso = start.toISOString().slice(0, 10);
    const endIso = end.toISOString().slice(0, 10);

    const overrides = await this.overridesRepo
      .createQueryBuilder('o')
      .select('o.date')
      .where('o.date BETWEEN :start AND :end', { start: startIso, end: endIso })
      .getMany();

    const excluded = new Set(overrides.map((o) => o.date));
    const workingDays: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const iso = date.toISOString().slice(0, 10);
      const dow = date.getDay();
      const isDefaultWorking = dow >= 0 && dow <= 4; // Sun-Thu
      if (isDefaultWorking && !excluded.has(iso)) {
        workingDays.push(day);
      }
    }

    return workingDays;
  }
}
