import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Allocation } from './allocation.entity';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(Allocation)
    private readonly repo: Repository<Allocation>,
  ) {}

  create(dto: CreateAllocationDto) {
    const allocation = this.repo.create(dto);
    return this.repo.save(allocation);
  }

  findAll() {
    return this.repo.find();
  }

  findByProjectAndMonth(project: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    return this.repo.find({
      where: {
        project_name: project,
        date: Between(start, end),
      },
      order: { date: 'ASC' },
    });
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
