import { Body, Controller, Post } from '@nestjs/common';
import { WorkingDaysService } from './working-days.service';
import { WorkingDayDto } from './dto/working-day.dto';

@Controller('working-days')
export class WorkingDaysController {
  constructor(private readonly service: WorkingDaysService) {}

  @Post()
  createOrUpdate(@Body() dto: WorkingDayDto) {
    return this.service.createOrUpdate(dto);
  }

  @Post('bulk')
  async replaceMonth(@Body() dtos: WorkingDayDto[]) {
    await this.service.replaceMonth(dtos);
    return { success: true };
  }
}
