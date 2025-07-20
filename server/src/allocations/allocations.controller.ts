import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('allocations')
@Controller('allocations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AllocationsController {
  constructor(private readonly service: AllocationsService) {}

  @Get()
  @ApiQuery({ name: 'project', required: false })
  @ApiQuery({ name: 'team_name', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  findAll(
    @Query('project') project?: string,
    @Query('team_name') team_name?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.service.searchAllocations({ project, team_name, year, month, start, end });
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
