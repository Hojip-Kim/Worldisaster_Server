import { Controller, Get } from '@nestjs/common';
import { DisastersListService } from './disasters.service';

@Controller('disasters')
export class DisastersController {
    constructor(private readonly disastersListService: DisastersListService) { }

    @Get('debug_list_force_refresh')
    async force_refresh(): Promise<{ success: boolean }> {
        return await this.disastersListService.fetchAndCompareCount();
    }
}
