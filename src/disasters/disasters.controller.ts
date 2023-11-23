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

    /* Actual API Implementation */

    @Get('/')
    async getAllDetails(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters detail');
        return await this.disastersService.getAllDisasters();
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

    // @Get('/:country/:type/:year')
    // async getByCountryTypeYear(@Param('country') country: string, @Param('type') type: string, @Param('year') year: string): Promise<DisastersDetailEntity[]> {
    //     console.log('API : GET call made to fetch disasters by country, type, and year');
    //     if (country.length == 2) {
    //         return this.disastersService.getDisastersByCountryCodeTypeAndYear(country, type, year);
    //     } else {
    //         console.log('아직 안만들었다');
    //     }
    // }
}
