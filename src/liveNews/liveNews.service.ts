import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { LiveNewsEntity } from './liveNews.entity';
import { OldDisastersEntity } from '../oldDisasters/oldDisasters.entity';

import { stringify } from 'querystring';

@Injectable()
export class LiveNewsService {
    constructor(
        @InjectRepository(LiveNewsEntity)
        private liveArticleRepository: Repository<LiveNewsEntity>,
        @InjectRepository(OldDisastersEntity)
        private oldDisasterRepository: Repository<OldDisastersEntity>,
    ) {}

    /* dID를 통해 재난 타입 가져오는 코드*/
    async getDisastersTypeBydID(dID: string): Promise<{ dType: string, dCountry: string, dDate: string }> {
        const getDisasterDetail =  await this.oldDisasterRepository
        .createQueryBuilder('disaster')
        .where('disaster.dID = :dID', { dID })
        .getOne();

        const dDate = getDisasterDetail.dDate;
        const dCountry = getDisasterDetail.dCountry;
        const dType = getDisasterDetail.dType;

        // console.log('In getDisastersTypeBydID');
        // console.log(`year: ${dDate}, country: ${dCountry}, dType: ${dType}`);

        // const articles = await this.getDisastersByCountryAndYearAndTypeAndID(country, year, dType, dID);

        return {
            dType: getDisasterDetail.dType,
            dCountry: getDisasterDetail.dCountry,
            dDate: getDisasterDetail.dDate,
        };
    }

    async getDisastersID() {
        const result = await this.oldDisasterRepository
            .createQueryBuilder('disaster')
            .select('disaster.dID')
            .where('disaster.dDate >= :date', { date : '2023-10-01' })
            .getMany();
        if(result.length === 0) {
            throw new Error('No disasters found after the specified date.');
        }
        return result;
    }

    //!SECTION Mediastack API
    //NOTE - 하루 1000번 제한, 기간 가늠 안됨
    //다른 사람들 git issue에도 keywords 관련 문제가 올라와있으나, 해결되지 않은것으로 보임. https://github.com/apilayer/mediastack/issues/3
    //하나만 검색하는건 되지만, 두개 검색은 안됨
    //country를 따로 검색할 수 있으나, 해당 기사의 국가이며, 국가의 종류도 턱없이 적다. 13개다. 말도 안된다.
    //해결했다. 어이없다. 띄어쓰기다. https://github.com/apilayer/mediastack/issues/3 이거 자세히 보니 띄어쓰기를 해야 검색이 된다고 나와있다
    async storeLiveArticle(dID: string, dDate: string, dType: string, dCountry: string) {
        const axios = require('axios');
        const disasterDetail = await this.oldDisasterRepository.findOne({ where: {dID} });

        const params = stringify({
            access_key: '5057f1372fdc2004d02af923fdeff472', // 여기에 실제 액세스 키를 입력하세요
            category : 'general',
            sort: 'published_desc',
            keywords: `${dType} ${dCountry}`,
            date: `${dDate}`,
            limit: 3,
        });
        
        try 
        {
            const response = await axios.get(`http://api.mediastack.com/v1/news?${params}`);
            for (let article of response.data.data) 
            {
                const headline = article.title;
                const url = article.url;
                
                const liveArticle = new LiveNewsEntity();
                liveArticle.headline = headline;
                liveArticle.url = url;
                liveArticle.disasterDetail = disasterDetail; // 할당
                liveArticle.author = article.author;
                liveArticle.image = article.image;

                await this.liveArticleRepository.save(liveArticle);
                console.log(`success save article ${headline}`);
            }
        } catch (error) {
            if (error.response) {
                // 서버에서 반환된 응답 내용을 로깅
                console.error('Server response:', error.response.data);
            } else {
                // 그 외의 오류 처리
                console.error('Error fetching news:', error.message);
            }
        }
    }
    //!SECTION End Mediastack API

    //!SECTION Get Live News Service
    async getLiveArticleBydID(dID: string): Promise<LiveNewsEntity[]> {
        const liveNewsTable = await this.liveArticleRepository.find({ where: { disasterDetail : {dID} }});
        return liveNewsTable;
    }
    //!SECTION End Get Live News Service 
}