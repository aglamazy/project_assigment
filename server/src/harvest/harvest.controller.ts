import {Controller, Get, Query} from '@nestjs/common';
import {HarvestService} from './harvest.service';

@Controller('harvest')
export class HarvestController {
    constructor(private readonly service: HarvestService) {
    }

    @Get('projects')
    getProjects(@Query('month') month?: string) {
        const monthNum = month ? parseInt(month, 10) : new Date().getMonth() + 1;
        return [{id: 1, name: "Dimri"}, {id: 2, name: "Magen"}];
        // this.service.getProjects(monthNum);
    }
}
