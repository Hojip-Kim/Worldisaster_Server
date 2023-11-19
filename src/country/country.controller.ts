import { Controller, Get, Param } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryEntity } from './country.entity';

@Controller('country')
export class CountryController {
    constructor(private readonly countryService: CountryService) { }

    /* Debugger API (to-delete) */

    @Get('/')
    async debug_get_all_countries(): Promise<CountryEntity[]> {
        console.log('API : GET call made to fetch all countries (Debug)');
        return await this.countryService.getAllCountries();
    }

    @Get('forceSync')
    async debug_force_refresh(): Promise<{ success: boolean, message: string }> {
        console.log('API : GET call made to force refresh country DB (Debug)');
        return await this.countryService.updateCountryProfiles();
    }

    /* country/profile */

    @Get('profile/:countryCode')
    async getCountryProfileByCode(@Param('countryCode') countryCode: string) {
        return await this.countryService.getCountryByCode(countryCode);
    }

    @Get('profile/:countryName')
    async getCountryProfileByName(@Param('countryName') countryName: string) {
        // countryName = decodeURIComponent(countryName);
        return await this.countryService.getCountryByName(countryName);
    }
}