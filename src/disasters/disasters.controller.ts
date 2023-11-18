import { Controller, Get, Param } from '@nestjs/common';
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
    @Get('archive/detail')
    async getDisastersArchiveDetail(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters detail');
        return await this.disastersService.getAllDisasters();
    }

    @Get('archive/:Country')
    async getDisastersArchiveByCountry(@Param('Country') country: string): Promise<DisastersDetailEntity[]> {
        return this.disastersService.getDisastersByCountry(country);
    }

    @Get('archive/:Country/:year')
    async getDisastersArchiveByCountryAndYear(@Param('Country') country: string, @Param('year') year: string): Promise<DisastersDetailEntity[]> {
        return this.disastersService.getDisastersByCountryAndYear(country, year);
    }
}