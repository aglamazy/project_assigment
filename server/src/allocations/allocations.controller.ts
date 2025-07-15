import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';

@Controller('allocations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AllocationsController {
  constructor(private readonly service: AllocationsService) {}

  @Get()
  findAll(
    @Query('project') project?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    if (start && end) {
      if (project) {
        return this.service.findByProjectAndDateRange(project, start, end);
      }
      return this.service.findByDateRange(start, end);
    }
    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      if (isNaN(y) || isNaN(m)) {
        throw new BadRequestException('Invalid year or month');
      }
      if (project) {
        return this.service.findByProjectAndMonth(project, y, m);
      }
      return this.service.findByMonth(y, m);
    }
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAllocationDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAllocationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
