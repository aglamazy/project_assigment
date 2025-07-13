import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { GlobalsService } from './globals.service';

@Controller('globals')
export class GlobalsController {
  constructor(private readonly service: GlobalsService) {}

  @Get('working-days')
  async getWorkingDays(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (isNaN(y) || isNaN(m)) {
      throw new BadRequestException('Invalid year or month');
    }
    const workingDays = await this.service.getWorkingDays(y, m);
    return { workingDays };
  }
}
