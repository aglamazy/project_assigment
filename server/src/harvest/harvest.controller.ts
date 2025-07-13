import { Controller, Get, Query } from '@nestjs/common';
import { HarvestService } from './harvest.service';

@Controller('harvest')
export class HarvestController {
  constructor(private readonly service: HarvestService) {}

  @Get('projects')
  getProjects(@Query('month') month?: string) {
    const monthNum = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    return this.service.getProjects(monthNum);
  }
}
