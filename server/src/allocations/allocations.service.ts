import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Allocation } from './allocation.entity';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation)
    private readonly repo: Repository<Allocation>,
  ) {}

  async create(dto: CreateAllocationDto) {
    const { override, ...data } = dto as any;
    const overlaps = await this.repo.find({
      where: {
        team_name: data.team_name,
        start_date: LessThanOrEqual(data.end_date),
        end_date: MoreThanOrEqual(data.start_date),
      },
      order: { start_date: 'ASC' },
    });
    if (overlaps.length > 0 && !override) {
      const days: Set<string> = new Set();
      const newStart = new Date(data.start_date);
      const newEnd = new Date(data.end_date);
      for (const o of overlaps) {
        const start = new Date(o.start_date) > newStart ? new Date(o.start_date) : newStart;
        const end = new Date(o.end_date) < newEnd ? new Date(o.end_date) : newEnd;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.add(d.toISOString().slice(0, 10));
        }
      }
      return { overlapDays: Array.from(days) };
    }

    if (override && overlaps.length > 0) {
      const newStart = new Date(data.start_date);
      const newEnd = new Date(data.end_date);
      for (const o of overlaps) {
        const oStart = new Date(o.start_date);
        const oEnd = new Date(o.end_date);

        const before = oStart < newStart;
        const after = oEnd > newEnd;

        if (before && after) {
          const afterAlloc = this.repo.create({
            team_name: o.team_name,
            project_name: o.project_name,
            start_date: new Date(newEnd.getTime() + 86400000).toISOString().slice(0, 10),
            end_date: o.end_date,
            hours: o.hours,
          });
          o.end_date = new Date(newStart.getTime() - 86400000).toISOString().slice(0, 10);
          await this.repo.save(o);
          await this.repo.save(afterAlloc);
        } else if (before) {
          o.end_date = new Date(newStart.getTime() - 86400000).toISOString().slice(0, 10);
          await this.repo.save(o);
        } else if (after) {
          o.start_date = new Date(newEnd.getTime() + 86400000).toISOString().slice(0, 10);
          await this.repo.save(o);
        } else {
          await this.repo.remove(o);
        }
      }
    }

    const allocation = this.repo.create(data);
    return this.repo.save(allocation);
  }


  async searchAllocations({ project, team_name, year, month, start, end }: { project?: string, team_name?: string, year?: string, month?: string, start?: string, end?: string }) {
    let where: any = {};
    // Date range logic
    let rangeStart: string | undefined;
    let rangeEnd: string | undefined;
    if (start && end) {
      rangeStart = start;
      rangeEnd = end;
    } else if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      if (!isNaN(y) && !isNaN(m)) {
        rangeStart = new Date(y, m - 1, 1).toISOString().slice(0, 10);
        rangeEnd = new Date(y, m, 0).toISOString().slice(0, 10);
      }
    }
    if (rangeStart && rangeEnd) {
      where.start_date = LessThanOrEqual(rangeEnd);
      where.end_date = MoreThanOrEqual(rangeStart);
    }
    if (project) {
      where.project_name = project;
    }
    if (team_name) {
      where.team_name = team_name;
    }
    return this.repo.find({ where, order: { start_date: 'ASC' } });
  }


  async findOne(id: string) {
    const allocation = await this.repo.findOne({ where: { id } });
    if (!allocation) {
      throw new NotFoundException('Allocation not found');
    }
    return allocation;
  }

  async update(id: string, dto: UpdateAllocationDto) {
    const allocation = await this.findOne(id);
    Object.assign(allocation, dto);
    return this.repo.save(allocation);
  }

  async remove(id: string) {
    const allocation = await this.findOne(id);
    await this.repo.remove(allocation);
    return { deleted: true };
  }
}
