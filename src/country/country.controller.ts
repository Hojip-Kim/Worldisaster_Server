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

    @Get('/:country')
    async getCountryProfileByCode(@Param('country') country: string) {
        console.log('API : GET call made to fetch country profile');

        if (country.length == 2) {
            return await this.countryService.getCountryByCode(country);
        } else {
            return await this.countryService.getCountryByName(country);
        }
    }
}