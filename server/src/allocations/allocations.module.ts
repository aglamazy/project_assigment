import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from './allocation.entity';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Allocation])],
  providers: [AllocationsService],
  controllers: [AllocationsController],
})
export class AllocationsModule {}
