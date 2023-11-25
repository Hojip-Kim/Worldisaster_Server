import { Controller, Get, Param, Query } from '@nestjs/common';
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

    /* Actual API Implementation */

    @Get('/live')
    async getByStatusOngoing(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters by status (ongoing)');

        return this.disastersService.getDisastersByStatusOngoing();
    }

    @Get('/archive')
    async getByStatusPast(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters by status (past)');

        return this.disastersService.getDisastersByStatusPast();
    }

    

    @Get('/')
    async getAllDetails(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters detail');
        return await this.disastersService.getAllDisasters();
    }
    
    @Get('/filtered')
    async getDisasters(
        @Query('country') country?: string,
        @Query('year') year?: string,
        @Query('type') type?: string
    ): Promise<DisastersDetailEntity[]> {
        console.log('API : filtered GET call');
        return this.disastersService.getDisastersFiltered(country, year, type);
    }
    
    @Get('/detailJson/:dID')
    async getDisastersDetailBydID(@Param('dID') dID: string): Promise<DisastersDetailEntity> {
        return this.disastersService.getDisastersDetailBydID(dID);
    }

    @Get('/:country')
    async getByCountry(@Param('country') country: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters by country');

        if (country.length == 2) {
            return this.disastersService.getDisastersByCountryCode(country);
        } else {
            return this.disastersService.getDisastersByCountryName(country);
        }
    }

    @Get('/:country/:year')
    async getByCountryAndYear(@Param('country') country: string, @Param('year') year: string): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters by country and year')

        if (country.length == 2) {
            return this.disastersService.getDisastersByCountryCodeAndYear(country, year);
        } else {
            return this.disastersService.getDisastersByCountryNameAndYear(country, year);
        }
    }


    
}
