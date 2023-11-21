import { Controller, Get, Param, Query } from '@nestjs/common';
import { DisastersService } from './disasters.service';
import { DisastersDetailEntity } from './disasters-detail.entity';
import { NYTArchiveEntity } from './archive_news.entity';

@Controller('disasters')
export class DisastersController {
    constructor(private readonly disastersService: DisastersService) { }

    /* Debugger API (to-delete) */

    @Get('/')
    async debug_get_all_disasters(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters');
        return await this.disastersService.getAllDisasters();
    }

    @Get('force')
    async debug_force_refresh(): Promise<{ success: boolean, message: string }> {
        console.log('API : GET call made to force refresh disasters DB (Debug)');
        return await this.disastersService.fetchAndCompareCount();
    }

    /* disaster/archive */
    @Get('archive')
    async getDisastersArchiveDetail(): Promise<DisastersDetailEntity[]> {
        console.log('API : GET call made to fetch all disasters detail');
        return await this.disastersService.getAllDisasters();
    }

    /* NYT Archive API 호출 후 DB에 저장 */
    @Get('archive/force')
    async storeForceArchiveNews(): Promise<{ success: boolean, message: string }> {
        return await this.disastersService.fetchAndStoreNYTData();
    }
    
    @Get('archive/:Country')
    async getDisastersArchiveByCountry(@Param('Country') country: string): Promise<DisastersDetailEntity[]> {
        return this.disastersService.getDisastersByCountry(country);
    }

    @Get('archive/:Country/:year')
    async getDisastersArchiveByCountryAndYear(@Param('Country') country: string, @Param('year') year: string): Promise<DisastersDetailEntity[]> {
        return this.disastersService.getDisastersByCountryAndYear(country, year);
    }

    

    @Get('archive/:Country/:year/:dID')
    async getDisastersArchiveByCountryAndYearAndID(@Param('Country') country: string, @Param('year') year: string, @Param('dID') dID: string): Promise<NYTArchiveEntity[]> {
        /* dID로 재난 타입 가져와서 변수에 저장 */
        const disasterTable = await this.disastersService.getDisastersTypeBydID(dID);
        const dType = disasterTable.dType;
        return this.disastersService.getNewsByID(dID);
        /* 저장한 재난 타입 및 country, year를 뉴스 기사 필터링하는 함수에 인자로 넣기*/
        // return this.disastersService.getDisastersByCountryAndYearAndTypeAndID(country, year, dType, dID);
        /* 필터링 된 뉴스 기사는 해당 재난과 dID로 연결되어있기 떄문에, dID로 뉴스기사를 조회 */

        /* 조회된 뉴스기사들을 return */
        
        // return this.disastersService.getDisastersByCountryAndYear(country, year);
    }

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

    @Get('/filtered')
    async getDisasters(
        @Query('country') country?: string, 
        @Query('year') year?: string, 
        @Query('type') type?: string
    ): Promise<DisastersDetailEntity[]> {
        return this.disastersService.getDisastersFiltered(country, year, type);
    }
}