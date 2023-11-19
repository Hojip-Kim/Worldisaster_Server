import { Controller, Get, Param } from '@nestjs/common';
import { DisastersService } from './disasters.service';
import { DisastersDetailEntity } from './disasters-detail.entity';

@Controller('disasters')
export class DisastersController {
    constructor(private readonly disastersService: DisastersService) { }

    /* Debugger API (to-delete) */

    @Get('forceSync')
    async debug_force_refresh(): Promise<{ success: boolean, message: string }> {
        console.log('API : GET call made to force refresh disasters DB (Debug)');
        return await this.disastersService.fetchAndCompareCount();
    }

    /* disasters/archive (uuuj) */

    @Get('archive')
    async getDisastersArchiveDetail(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters detail');
        return await this.disastersService.getAllDisasters();
    }

    @Get('archive/:countryName')
    async getDisastersArchiveByCountry(@Param('countryName') countryName: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters per country');
        // countryName = decodeURIComponent(countryName);
        return this.disastersService.getDisastersByCountry(countryName);
    }

    @Get('archive/:countryName/:year')
    async getDisastersArchiveByCountryAndYear(@Param('countryName') countryName: string, @Param('year') year: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters by country and year')
        // countryName = decodeURIComponent(countryName);
        return this.disastersService.getDisastersByCountryAndYear(countryName, year);
    }
}
