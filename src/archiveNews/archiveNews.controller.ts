import { Controller, Get, Param } from "@nestjs/common";
import { ArchiveNewsService } from "./archiveNews.service";
import { LiveNewsEntity } from "src/liveNews/liveNews.entity";
import { ArchiveNewsEntity } from "./archiveNews.entity";

@Controller('archiveNews')
export class ArchiveNewsController {
    constructor(private readonly archiveNewsService: ArchiveNewsService) { }

    @Get('/:dID')
    async getArchiveNewsBydID(@Param('dID') dID: string): Promise<ArchiveNewsEntity[]> {
        return await this.archiveNewsService.getArchiveNewsBydID(dID);
    }
}