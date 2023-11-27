import { Controller, Get, Param } from '@nestjs/common';
import { NewDisastersService } from './newDisasters.service';
import { NewDisastersEntity } from './newDisasters.entity';

@Controller('newDisasters')
export class NewDisastersController {
    constructor(private readonly disastersService: NewDisastersService) { }

    /* Initial Server Setup API */

    @Get('forceSync')
    async debug_force_refresh(): Promise<{ success: boolean, message: string }> {
        console.log("\nAPI : GET call made to force refresh newDisasters DB");
        return await this.disastersService.handleDisasterUpdate();
    }
}
