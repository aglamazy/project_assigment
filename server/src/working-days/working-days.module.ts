import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingDay } from './working-day.entity';
import { WorkingDaysService } from './working-days.service';
import { WorkingDaysController } from './working-days.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkingDay])],
  controllers: [WorkingDaysController],
  providers: [WorkingDaysService],
})
export class WorkingDaysModule {}
