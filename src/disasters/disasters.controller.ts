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

    @Get('/')
    async getAllDetails(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters detail');
        return await this.disastersService.getAllDisasters();
    }

    @Get('code/:countryCode')
    async getByCountryCode(@Param('countryCode') countryCode: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters per country code');
        return this.disastersService.getDisastersByCountryCode(countryCode);
    }

    @Get('code/:countryCode/:year')
    async getByCountryCodeAndYear(@Param('countryCode') countryCode: string, @Param('year') year: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters by country code and year')
        return this.disastersService.getDisastersByCountryCodeAndYear(countryCode, year);
    }

    @Get('name/:countryName')
    async getByCountryName(@Param('countryName') countryName: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters per country name');
        // countryName = decodeURIComponent(countryName);
        return this.disastersService.getDisastersByCountryName(countryName);
    }

    @Get('name/:countryName/:year')
    async getByCountryNameAndYear(@Param('countryName') countryName: string, @Param('year') year: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters per country name and year')
        return this.disastersService.getDisastersByCountryNameAndYear(countryName, year);
    }
}
