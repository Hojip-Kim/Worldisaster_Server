import { Controller, Get, Param, Query } from '@nestjs/common';
import { LiveNewsEntity } from './liveNews.entity';
import { LiveNewsService } from './liveNews.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { get } from 'http';

@Controller('live')
export class LiveNewsController {
    constructor(private readonly liveNewsService: LiveNewsService) { 
        
    }
    @Get('force')
        async storeDisastersLiveArticle() {
        console.log('API storeDisastersLiveArticle');
        // test용으로 2023년 10월 1일 이후의 재난만 저장
        const getDisastersIDList = await this.liveNewsService.getDisastersID();

        for (let i = 0; i < getDisastersIDList.length; i++) {
            const dID = getDisastersIDList[i].dID;
            const infoDisaster = await this.liveNewsService.getDisastersTypeBydID(dID);
            const dCountry = await infoDisaster.dCountry;
            const dType = await infoDisaster.dType;
            const dDate = await infoDisaster.dDate;
            await this.liveNewsService.storeLiveArticle(dID, dDate, dType, dCountry);
        }
        // const dType = 'flood'
        // const dCountry = 'Kenya'
        // const dDate = '2023-10-15'
        // const dID = '51799'
        // await this.disastersService.storeLiveArticle(dID, dDate, dType, dCountry);
    
    }
    //dID로 news 조회
    @Get('/:dID')
    async getLiveArticleBydID(@Param('dID') dID: string): Promise<LiveNewsEntity[]> {
        console.log('API get articles by dID');
        return this.liveNewsService.getLiveArticleBydID(dID);
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        console.log("\n@ Get Live News Every MINUTE @\n");
        await this.liveNewsService.fetchAndStoreRealtimeDisasterNews();
    }
}