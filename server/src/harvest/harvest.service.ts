import {Injectable, Logger} from '@nestjs/common';
import axios from 'axios';
import {ConfigService} from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class HarvestService {
    private readonly logger = new Logger(HarvestService.name);
    private readonly redis: Redis;
    private readonly headers: Record<string, string>;

    constructor(private readonly configService: ConfigService) {
        const token = this.configService.get<string>('HARVEST_API_TOKEN');
        const accountId = this.configService.get<string>('HARVEST_ACCOUNT_ID');

        this.headers = {
            Authorization: `Bearer ${token}`,
            'Harvest-Account-ID': accountId,
            'Content-Type': 'application/json',
        };

        this.redis = new Redis(); // or inject if using @nestjs/redis module
    }

    async fetchTeammates(): Promise<{ id: string; name: string; email: string }[]> {
        const cacheKey = 'teammates';

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            const response = await axios.get('https://api.harvestapp.com/v2/users', {
                headers: this.headers,
            });

            const teammates = response.data.users
                .filter((user: any) => user.is_active)
                .map((user: any) => ({
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                }));

            await this.redis.set(cacheKey, JSON.stringify(teammates), 'EX', 3600);
            this.logger.log(`Fetched and cached ${teammates.length} teammates.`);
            return teammates;
        } catch (error: any) {
            this.logger.error('Error fetching teammates', error.response?.data || error.message);
            throw error;
        }
    }

    async getProjects(): Promise<{ id: string; name: string; }[]> {
        const cacheKey = 'projects';

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            const response = await axios.get('https://api.harvestapp.com/v2/projects?is_active=true',
                {
                    headers: this.headers,
                });

            const projects = response.data.projects.map(({ id, name }) => ({ id, name }));

            await this.redis.set(cacheKey, JSON.stringify(projects), 'EX', 2);
            this.logger.log(`Fetched and cached ${projects.length} projects.`);
            return projects;
        } catch (error: any) {
            this.logger.error('Error fetching teammates', error.response?.data || error.message);
            throw error;
        }
    }

    async getClients(): Promise<{ id: string; name: string; }[]> {
        const cacheKey = 'clients';

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            const response = await axios.get('https://api.harvestapp.com/v2/clients?is_active=true',
                {
                    headers: this.headers,
                });

            const clients = response.data.clients.map(({ id, name }) => ({ id, name }));

            await this.redis.set(cacheKey, JSON.stringify(clients), 'EX', 2);
            this.logger.log(`Fetched and cached ${clients.length} clients.`);
            return clients;
        } catch (error: any) {
            this.logger.error('Error fetching teammates', error.response?.data || error.message);
            throw error;
        }
    }

}
