import { Controller, Get } from '@nestjs/common';
import { DisastersService } from './disasters.service';
import { DisastersDetailEntity } from './disasters-detail.entity';

@Controller('disasters')
export class DisastersController {
    constructor(private readonly disastersService: DisastersService) { }

    /* Debugger API (to-delete) */

    @Get('/')
    async debug_get_all_disasters(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters');
        return await this.disastersService.getAllDisasters();
    }

    @Get('force')
    async debug_force_refresh(): Promise<{ success: boolean, message: string }> {
        console.log('API : GET call made to force refresh disasters DB (Debug)');
        return await this.disastersService.fetchAndCompareCount();
    }

    /* disaster/archive */
    @Get('archive')
    async getDisastersArchive(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters');
        return await this.disastersService.getAllDisasters();
    }
}