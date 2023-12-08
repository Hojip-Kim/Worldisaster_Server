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
    ) { }

    /* dID를 통해 재난 타입 가져오는 코드*/
    async getDisastersTypeBydID(dID: string): Promise<{ dType: string, dCountry: string, dDate: string }> {
        const getDisasterDetail = await this.newDisasterRepository
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
        const result = await this.newDisasterRepository
            .createQueryBuilder('disaster')
            .select('disaster.dID')
            .where('disaster.dStatus = :status', { status: 'real-time' })
            .getMany();
        if (result.length === 0) {
            throw new Error('No disasters found with real-time status.');
        }
        return result;
    }

    formatDate(dDate: string): string {
        const date = new Date(dDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`

    }

    //!SECTION Mediastack API
    //NOTE - 한달 1000번 제한, 기간 가늠 안됨
    //다른 사람들 git issue에도 keywords 관련 문제가 올라와있으나, 해결되지 않은것으로 보임. https://github.com/apilayer/mediastack/issues/3
    //하나만 검색하는건 되지만, 두개 검색은 안됨
    //country를 따로 검색할 수 있으나, 해당 기사의 국가이며, 국가의 종류도 턱없이 적다. 13개다. 말도 안된다.
    //해결했다. 어이없다. 띄어쓰기다. https://github.com/apilayer/mediastack/issues/3 이거 자세히 보니 띄어쓰기를 해야 검색이 된다고 나와있다
    async storeLiveArticle(dID: string, dDate: string, dType: string, dCountry: string) {

        const axios = require('axios');
        const disasterDetail = await this.newDisasterRepository.findOne({ where: { dID } });
        const formmatDate = this.formatDate(dDate);
        const params = stringify({
            access_key: process.env.MEDIA_STACK_API_KEY, // 여기에 실제 액세스 키를 입력하세요
            category: 'general',
            sort: 'published_desc',
            keywords: `${dType} ${dCountry}`,
            date: `${formmatDate}`,
            limit: 10,
        });
        // console.log(`dID : ${dID} dType : ${dType} dCountry : ${dCountry}`)
        try {
            const response = await axios.get(`http://api.mediastack.com/v1/news?${params}`);
            for (let article of response.data.data) {
                const headline = article.title;
                const url = article.url;
                
                const liveArticle = new LiveNewsEntity();
                liveArticle.headline = headline;
                liveArticle.url = url;
                liveArticle.dID = dID; // 할당
                liveArticle.author = article.author;
                liveArticle.image = article.image;
                // console.log(liveArticle);
                await this.liveArticleRepository.save(liveArticle);
                // console.log(`success save article ${headline}`);
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
        // await this.removeDuplicateArticles();
    }
    //!SECTION End Mediastack API

    //!SECTION Get Live News Service
    async getLiveArticleBydID(dID: string): Promise<LiveNewsEntity[]> {
        const liveNewsTable = await this.liveArticleRepository.find({ where: { dID } });
        // console.log(dID);
        // console.log(liveNewsTable);
        if (!liveNewsTable) {
            throw new Error('No live news found.');
        }
        return liveNewsTable;
    }
    //!SECTION End Get Live News Service 

    async removeDuplicateArticles() {
        // 각 URL별로 가장 최신 기사의 ID 찾기
        const latestArticleIds = await this.liveArticleRepository
            .createQueryBuilder('article')
            .select('MAX(article.objectId)', 'objectId') // 'id'는 가정된 컬럼명입니다. 실제 데이터베이스에 맞게 조정하세요.
            .groupBy('article.dID')
            .groupBy('article.url')
            .getRawMany();

        if (latestArticleIds.length === 0) {
            throw new Error('No latest articles found.');
        }
        const latestIds = latestArticleIds.map(item => item.objectId);

        // 가장 최신 기사를 제외한 모든 중복 기사 삭제
        await this.liveArticleRepository
            .createQueryBuilder()
            .delete()
            .from(LiveNewsEntity) // 'Article'은 가정된 엔티티 클래스명입니다. 실제 데이터베이스에 맞게 조정하세요.
            .where('objectId NOT IN (:...ids)', { ids: latestIds })
            .execute();

        console.log(`Deleted duplicate articles, keeping the latest ones.`);
    }
    //newDisaster에서 dStatus가 real-time인 재난 가져오기
    async getRealtimeDisasters() {

        const realtimeDisasters = await this.newDisasterRepository.find({ where: { dStatus: 'real-time' } });

        if (realtimeDisasters.length === 0) {
            throw new Error('No real-time disasters found.');
        }
        return realtimeDisasters;
    }

    //realtime인 재난의 dID로 연결된 기사들의 개수 확인
    async getLiveNewsCountForDisaster(dID: string) {
        const liveNewsCount = await this.liveArticleRepository.count({ where: { dID } });
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
                // console.log(`Stored live news for disaster ID ${disaster.dID}.`);
            } else {
                // 기사 수가 10개 이상인 경우 pass
                // console.log(`Skipping disaster ID ${disaster.dID}, already has sufficient articles.`);
            }
        }
    }

}