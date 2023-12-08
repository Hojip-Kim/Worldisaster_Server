import { Controller, Get, Param } from '@nestjs/common';
import { NewDisastersService } from './newDisasters.service';
import { NewDisastersEntity } from './newDisasters.entity';

@Controller('newDisasters')
export class NewDisastersController {
    constructor(private readonly disastersService: NewDisastersService) { }

    /* Initial Server Setup API */

    @Get('forceSync')
    async debug_force_refresh(): Promise<{ success: boolean, message: string }> {
        console.log("\nAPI : GET call made to force refresh newDisasters DB...");
        return await this.disastersService.handleDisasterUpdate();
    }

    /* Actual APIs */

    @Get('/')
    async getAllDetails(): Promise<NewDisastersEntity[]> {
        console.log("\nAPI : GET call made to fetch all newDisasters detail");
        return await this.disastersService.getAllDisasters();
    }

    @Get('/year/:year/')
    async getByYear(@Param('year') year: string): Promise<NewDisastersEntity[]> {
        console.log("\nAPI : GET call made to fetch all newDisasters by year");
        return this.disastersService.getGdacsDisastesByYear(year);
    }

    @Get('/year/:year/:status')
    async getByYearAndStatus(@Param('year') year: string, @Param('status') status: string): Promise<NewDisastersEntity[]> {
        console.log("\nAPI : GET call made to fetch all newDisasters by year and status");
        return this.disastersService.getGdacsDisastesByYearAndStatus(year, status);
    }

    @Get('/status/:status')
    async getDisastersByStatus(@Param('status') status: string): Promise<NewDisastersEntity[]> {
        return this.disastersService.getDisastersByStatusService(status);
    }
}
