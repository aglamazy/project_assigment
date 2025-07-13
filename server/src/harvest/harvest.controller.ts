import {Controller, Get, Query} from '@nestjs/common';
import {HarvestService} from './harvest.service';

@Controller('harvest')
export class HarvestController {
    constructor(private readonly service: HarvestService) {
    }

    @Get('projects')
    getProjects() {
        return this.service.getProjects();
    }

    @Get('clients')
    getClients() {
        return this.service.getClients();
    }

}
