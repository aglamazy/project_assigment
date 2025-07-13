import {Controller, Get, InternalServerErrorException} from '@nestjs/common';
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

    @Get('team-members')
    async getTeamMembers() {
        try {
            const teammates = await this.service.fetchTeammates();
            return teammates.map(({ id, name }) => ({ id, name }));
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch team members');
        }
    }

}
