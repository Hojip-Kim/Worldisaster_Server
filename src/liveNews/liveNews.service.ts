import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';

import { LiveNewsEntity } from './liveNews.entity';
import { OldDisastersEntity } from '../oldDisasters/oldDisasters.entity';
import { NewDisastersEntity } from '../newDisasters/newDisasters.entity';
import { stringify } from 'querystring';

@Injectable()
export class LiveNewsService {
    constructor(
        @InjectRepository(LiveNewsEntity)
        private liveArticleRepository: Repository<LiveNewsEntity>,
        @InjectRepository(NewDisastersEntity)
        private newDisasterRepository: Repository<NewDisastersEntity>,
    ) {}

    /* dID를 통해 재난 타입 가져오는 코드*/
    async getDisastersTypeBydID(dID: string): Promise<{ dType: string, dCountry: string, dDate: string }> {
        const getDisasterDetail =  await this.newDisasterRepository
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
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        const oneDayAgo = new Date(year, month, day - 1);

        const formattedOneDayAgo = oneDayAgo.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식으로 변환

        const result = await this.newDisasterRepository
            .createQueryBuilder('disaster')
            .select('disaster.dID')
            .where('disaster.dDate >= :date', { date : formattedOneDayAgo })
            .getMany();
        if(result.length === 0) {
            throw new Error('No disasters found after the specified date.');
        }
        return result;
    }

    //!SECTION Mediastack API
    //NOTE - 한달 1000번 제한, 기간 가늠 안됨
    //다른 사람들 git issue에도 keywords 관련 문제가 올라와있으나, 해결되지 않은것으로 보임. https://github.com/apilayer/mediastack/issues/3
    //하나만 검색하는건 되지만, 두개 검색은 안됨
    //country를 따로 검색할 수 있으나, 해당 기사의 국가이며, 국가의 종류도 턱없이 적다. 13개다. 말도 안된다.
    //해결했다. 어이없다. 띄어쓰기다. https://github.com/apilayer/mediastack/issues/3 이거 자세히 보니 띄어쓰기를 해야 검색이 된다고 나와있다
    async storeLiveArticle(dID: string, dDate: string, dType: string, dCountry: string) {
        const axios = require('axios');
        const disasterDetail = await this.newDisasterRepository.findOne({ where: {dID} });

        const params = stringify({
            access_key: '5057f1372fdc2004d02af923fdeff472', // 여기에 실제 액세스 키를 입력하세요
            category : 'general',
            sort: 'published_desc',
            keywords: `${dType} ${dCountry}`,
            date: `${dDate}`,
            limit: 10,
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
        await this.removeDuplicateArticles();
    }
    //!SECTION End Mediastack API

    //!SECTION Get Live News Service
    async getLiveArticleBydID(dID: string): Promise<LiveNewsEntity[]> {
        const liveNewsTable = await this.liveArticleRepository.find({ where: { disasterDetail : {dID} }});
        if(!liveNewsTable) {
            throw new Error('No live news found.');
        }
        return liveNewsTable;
    }
    //!SECTION End Get Live News Service 

    async removeDuplicateArticles() {
        // 중복된 URL을 가진 기사 찾기
        const duplicates = await this.liveArticleRepository
        .createQueryBuilder('article')
        .groupBy('article.url')
        .having('COUNT(article.url) > 1')
        .getMany();

        if(duplicates.length === 0) {
            throw new Error('No duplicate articles found.');
        }
        // 중복된 기사 삭제
        for (const duplicate of duplicates) {
            await this.liveArticleRepository.delete({ url: duplicate.url });

        }
        console.log(`Deleted ${duplicates.length} duplicate articles.`);
    }
    //oldDisaster에서 dStatus가 ongoing이고, dDate가 현재 날짜로부터 한달 전 ~ 현재까지인 재난 가져오기
    async getRealtimeDisasters() {

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        const oneMonthAgo = new Date(year, month - 1, day);
        const oneDayAgo = new Date(year, month, day - 1);

        const formattedCurrentDate = currentDate.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식으로 변환
        const formattedOneMonthAgo = oneMonthAgo.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식으로 변환
        const formattedOneDayAgo = oneDayAgo.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식으로 변환

        // console.log(formattedOneMonthAgo);

        const realtimeDisasters = await this.newDisasterRepository.find({
        
            where: {
                dStatus: 'real-time',
                dDate: Between(formattedOneDayAgo, formattedCurrentDate)
                }
            });
        
        if (realtimeDisasters.length === 0) {
            throw new Error('No real-time disasters found.');
        }
        return realtimeDisasters;
    }

    //realtime인 재난의 dID로 연결된 기사들의 개수 확인
    async getLiveNewsCountForDisaster(dID: string) {
        const liveNewsCount = await this.liveArticleRepository.count({ where: { disasterDetail: { dID }  } });
        return liveNewsCount;
    }

    async fetchAndStoreRealtimeDisasterNews() {
        // 진행 중인 재난 조회
        const realtimeDisasters = await this.getRealtimeDisasters();
    
        for (const disaster of realtimeDisasters) {
            // 재난의 dID로 연결된 기사들의 개수 확인
            const articlesCount = await this.getLiveNewsCountForDisaster(disaster.dID);
    
            // 기사 수가 10개 미만인 경우 API 호출
            if (articlesCount < 10) {
                const underTenArticlesDisaster = await this.getDisastersTypeBydID(disaster.dID);

                // 가져온 기사를 데이터베이스에 저장
                await this.storeLiveArticle(disaster.dID, underTenArticlesDisaster.dDate, underTenArticlesDisaster.dType, underTenArticlesDisaster.dCountry);
                console.log(`Stored live news for disaster ID ${disaster.dID}.`);
            } else {
                // 기사 수가 10개 이상인 경우 pass
                console.log(`Skipping disaster ID ${disaster.dID}, already has sufficient articles.`);
            }
        }
    }

}