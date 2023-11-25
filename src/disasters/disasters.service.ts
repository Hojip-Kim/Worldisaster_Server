import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { DisastersList } from './disasters-list.entity';
import { DisastersDetailEntity } from './disasters-detail.entity';

import { NYTArchiveEntity } from './archive_news.entity';
import { LiveArticleEntity } from './liveNews.entity';

import { HttpService } from '@nestjs/axios'; // HTTP 요청 라이브러리
import * as sanitizeHtml from 'sanitize-html'; // HTTP 태그 정리 라이브러리
import { Cron, CronExpression } from '@nestjs/schedule'; // 스케쥴링 라이브러리
import { firstValueFrom } from 'rxjs'; // 첫 요청을 promise로 돌려줌
import { parse } from 'path';
import { stringify } from 'querystring';

// 새로운 재난이 발생하면 Push 해주는 웹소켓 등이 없으니, 주기적으로 리스트 확인이 필요함
@Injectable()
export class DisastersService {
    private baseUrl = 'https://api.reliefweb.int/v1/disasters?appname=apidoc&limit=1000';

    constructor(
        private httpService: HttpService, // HTTP 요청 라이브러리를 가져오고
        @InjectRepository(DisastersList) // 재난 목록 Entity의 리포지토리를 가져오고
        private disasterListRepository: Repository<DisastersList>,
        @InjectRepository(CountryMappings) // CountryMappings 테이블도 불러오고
        private countryMappingRepository: Repository<CountryMappings>,
        @InjectRepository(DisastersDetailEntity)
        private disasterDetailRepository: Repository<DisastersDetailEntity>,
        @InjectRepository(NYTArchiveEntity)
        private nytArchiveRepository: Repository<NYTArchiveEntity>,
        @InjectRepository(LiveArticleEntity)
        private liveArticleRepository: Repository<LiveArticleEntity>,
    ) { }

    /* 여기서부터는 API에 대응하는 Service */

    async getAllDisasters(): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository.createQueryBuilder('disaster').getMany();
    }

    /* 같은 Country끼리 묶는 service */
    async getDisastersByCountry(country: string): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
        .createQueryBuilder('disaster')
        .where('disaster.dCountry = :country', { country })
        .getMany();
    }

    /* 같은 Country 이면서 같은 연도끼리 묶는 service */
    async getDisastersByCountryAndYear(country: string, year: string): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountry = :country', { country })
            .andWhere('SUBSTRING(disaster.dDate, 1, 4) = :year', { year })
            .getMany();
    }

    //Status가 ongoing인 Disaster들을 호출하기
    async getDisastersByStatusOngoing(): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dStatus = :status', { status: 'ongoing' })
            .getMany();
    }

    //Status가 past인 Disaster들을 호출하기
    async getDisastersByStatusPast(): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dStatus = :status', { status: 'past' })
            .getMany();
    }

    async getDisastersByCountryCodeAndType(countryCode: string, dType: string): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountryCode = :countryCode', { countryCode })
            .andWhere('disaster.dType = :dType', { dType })
            .getMany();
    }

    async getDisastersByCountryNameAndType(country: string, dType: string): Promise<DisastersDetailEntity[]> {
        dType = dType.trim();
        console.log('dType:', dType);
        console.log('country:', country);
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountry = :country', { country })
            .andWhere('disaster.dType = :dType', { dType })
            .getMany();
    }
    
    async getDisastersFiltered(country?: string, year?: string, type?: string): Promise<DisastersDetailEntity[]> {
        // 필터링 로직 구현
        // 예: country, year, type에 따라 다른 쿼리 실행
        // 쿼리 빌더 시작
        let query = this.disasterDetailRepository.createQueryBuilder('disaster');

        // country 파라미터가 있으면 쿼리에 추가
        if (country) {
            query = query.andWhere('disaster.dCountry = :country', { country });
        }

        // year 파라미터가 있으면 쿼리에 추가
        if (year) {
            query = query.andWhere('SUBSTRING(disaster.dDate, 1, 4) = :year', { year });
        }

        // type 파라미터가 있으면 쿼리에 추가
        if (type) {
            query = query.andWhere('disaster.dType = :type', { type });
        }
        // 결과 반환
        return query.getMany();
    }
    
    async getDisastersDetailBydID(dID: string): Promise<DisastersDetailEntity> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dID = :dID', { dID })
            .getOne();
    }
    
    /* 여기서부터는 주기적으로 데이터를 갱신해주는 역할 */

    async fetchAndCompareCount(): Promise<{ success: boolean, message: string }> {

        console.log('Updating disaster lists table...');

        try {
            // API에서 'count' 필드를 추출
            const apiResponse = await firstValueFrom(this.httpService.get(this.baseUrl));
            const countFromApi = apiResponse.data.totalCount;

            // DB에서 entity 개수를 확인
            const countInDb = await this.disasterListRepository.count();

            // 두개를 비교해서, 차이가 난다면 fetchAndStoreAllDisasters() 호출
            if (countFromApi !== countInDb) {
                await this.fetchAndStoreAllDisasters();
                console.log('@ Disaster Auto Update Finished - DB update complete');
                return { success: true, message: 'Updated (Disasters)' };
            } else {
                // 숫자가 맞으니 굳이 업데이트 필요 없음 + forceRefresh를 위한 리턴값
                console.log('@ Disaster Auto Update Finished - Nothing to update');
                return { success: false, message: 'No Updates to make (Disasters)' };
            }
        } catch (error) {
            console.log('@ Disaster AUto Update Failed: ' + error.message);
            return { success: false, message: 'Update Failed (Disasters)' };
        }
    }

    async fetchAndStoreAllDisasters() {

        // ReliefWeb 구조를 참고, currentUrl 변수를 바꿔가면서 활용
        let currentUrl = this.baseUrl;

        // 각각의 1000개 단위 리스트를 배열에 저장하기 위해 우선 set으로 정의 (API 결과에 duplicate들이 있음)
        const allEntries = [];
        const uniqueIds = new Set();

        // ReliefWeb API가 중복값을 뱉기도 해서, 순회하면서 값들을 Set에 저장하는 식으로 처리 -> 서버 첫 구동시 1분 사이클이 3-4번 돌면 중복없이 완전해짐
        while (currentUrl) {
            const response = await firstValueFrom(this.httpService.get(currentUrl));
            // console.log('thousand-batch has this many entries in list: ', response.data.data.length);
            response.data.data.forEach(entry => {
                if (!uniqueIds.has(entry.id)) {
                    uniqueIds.add(entry.id);
                    allEntries.push(entry);
                }
            });

            currentUrl = response.data.links.next ? response.data.links.next.href : null;
        }

        // 배열이 비어있지 않다면 DB에 저장
        if (allEntries.length > 0) {
            await this.saveListToPostgreSQL(allEntries); // 리스트에 저장하고,
            await this.fetchAndSaveDisasterDetails(allEntries); // 그 리스트에서 새로운 재난을 찾아 저장
        }
    }

    async saveListToPostgreSQL(entries: any[]) {

        // 현재 DisasterListEntity 테이블의 모든 값들을 삭제하고 (새로운 것만 추가할수가 없음 ㅠㅠ)
        await this.disasterListRepository.delete({});

        // 삭제 결과를 한번 확인하고
        const count = await this.disasterListRepository.count();
        if (count !== 0) {
            console.log('Failed to update the disaster list properly');
            throw new Error('Failed in updating the list of disasters');
        }

        // 배열의 각 요소들을 하나씩 정리해서 DB에 삽입
        for (const entry of entries) {
            const disasterEntry = {
                dID: entry.id,
                dTitle: entry.fields.name,
                dApiUrl: entry.href
            };

            try {
                await this.disasterListRepository.save(disasterEntry);
            } catch (error) {
                console.error('Error saving to PostgreSQL:', error);
            }
        }
        console.log('Disaster list successfully saved to table');
    }

    async fetchAndSaveDisasterDetails(rawEntries: any[]) {

        // 먼저 앞서 저장한 DB에서 저장된 값들을 다 빼와서 배열에 저장하고, 거기서 dID의 Set를 생성
        const existingDbDetails = await this.disasterDetailRepository.find();
        const existingdIDs = new Set(existingDbDetails.map(detail => detail.dID));

        // rawEntries 배열을 필터링 (DB에 매칭되는 DID가 없는 경우)
        const newEntries = rawEntries.filter(entry => !existingdIDs.has(entry.id));
        if (newEntries.length == 0) {
            console.log('Disaster list updated, but no detailed entries to update');
            return;
        } else if (newEntries.length > 100) {
            console.log('Tons of updates to Disaster Details DB');
        } else {
            console.log('New update:', newEntries); // 첫 로딩에는 표시 안하도록
        }

        // 만일 newEntries의 크기가 너무 크다면 네트워크/용량 제어
        const BATCH_SIZE = 100;
        for (let i = 0; i < newEntries.length; i += BATCH_SIZE) {
            const batch = newEntries.slice(i, i + BATCH_SIZE); // JS의 slice()는 인덱스를 끝에서 멈춰줌

            // 필터링된 새로운 Entry를 Details 테이블에 추가
            const detailPromises = batch.map(async (entry) => {

                // HTTP Request를 만들기
                const response = await firstValueFrom(this.httpService.get(entry.href));

                // 반환되는 HTTP Response에 Data가 담겨있는지 확인
                const responseData = response.data.data[0];
                if (!responseData || !responseData.fields) {
                    console.error(`Invalid response format for disaster dID: ${entry.dID}`);
                    return; // 해당 데이터가 없는 Entry만 건너뛰기
                }
                const fields = responseData.fields;

                // 해당 국가를 찾아서 코드를 넣어두기 (entity 연결시 maintenance가 더 복잡해짐 (cc. regular queries))
                const countryEntity = await this.countryMappingRepository.findOne({
                    where: [
                        { cia_name: fields.primary_country.name },
                        { rw_name: fields.primary_country.name },
                        { other_name: fields.primary_country.name }
                    ]
                });
                const countryEntityCode = countryEntity.code;

                // 개별 엔티티 생성
                const detail = new DisastersDetailEntity();
                detail.dID = fields.id;
                detail.dStatus = fields.status;
                detail.dCountry = fields.primary_country.name;
                detail.dCountryCode = countryEntityCode;
                detail.dType = fields.primary_type.name;

                // dateTtime 형식에서 T를 사용해서 date만 뽑아오기
                const rawDate = new Date(fields.date.event);
                detail.dDate = rawDate.toISOString().split('T')[0];

                // Lat/lon이 없는 경우가 있음
                if (fields.primary_country && fields.primary_country.location) {
                    detail.dLatitude = fields.primary_country.location.lat;
                    detail.dLongitude = fields.primary_country.location.lon;
                } else {
                    detail.dLatitude = null;
                    detail.dLongitude = null;
                }

                detail.dTitle = fields.name;

                // HTML Tag/Attribute 제거
                detail.dDescription = fields.description ? sanitizeHtml(fields.description, {
                    allowedTags: [],
                    allowedAttributes: {},
                }) : null;

                detail.dUrl = fields.url;

                return this.disasterDetailRepository.save(detail);

            });

            // 배열에 있는 모든 Promise를 전부 기다리도록 하고 완성
            try {
                await Promise.all(detailPromises);
            } catch (error) {
                console.error('Error with batch:', i, error);
            }

        } // 여기까지 100개 단위로 처리

        console.log('New or updated disaster details saved successfully');
    }

    // 정해진 시간마다 여기서 함수가 시작, fetchAndCompareCount를 실행
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        console.log("\n@ Disaster Auto Update Started - Regular 1-minute API Request made to fetch Disasters");
        await this.fetchAndCompareCount();
    }

    /* NYT Archive API 호출 및 응답 반환 */
    async fetchNYTArchive(year, month) {
        /* API 호출해서 year에 맞는 데이터 중에서도 특정 필드만 뽑아서 반환 */
        const apiKey = 'GP4oUYhkEpNf2CAOI62kgwNFu98XGtG7';
        const url = `https://api.nytimes.com/svc/archive/v1/${year}/${month}.json?api-key=${apiKey}`
        
        try{
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch(error) {
            console.log('Error fetching NYT Archive:', error);
            throw error;    //오류를 다시 발생시켜 호출한 함수에 알린다
        }   
    }

    async parseNYTResponse(response, year) {
        // NYT 응답에서 'docs' 배열 추출
        const articles = response.response.docs;
        // console.log('in parseNYTResponse');
        // console.log(Array.isArray(response.response.docs)); // 이것이 true를 반환해야 합니다
        // 각 기사를 NYTArchiveEntity 형식으로 변환
        return articles.map(article => {
            return {
                web_url : article.web_url,
                snippet : article.snippet,
                headline_main : article.headline.main,
                keywords_name : article.keywords.map(keyword => keyword.name).join(', '),
                keywords_value : article.keywords.map(keyword => keyword.value).join(', '),
                document_type: article.document_type,
                section_name: article.section_name,
                _id: article._id,
                year: year,
            };
        });
    }

    async storeArticlesInDB(articles, month) {
        
        for (const article of articles) {
            
            
                const nytArchiveEntity = this.nytArchiveRepository.create(article);
                await this.nytArchiveRepository.save(nytArchiveEntity);
            
        }
    }

    /* 여기서부터는 New York Times Archive API 데이터 가공 및 파싱하는 로직 */
    async fetchAndStoreNYTData() {
        for (let year = 2001; year <=2019; year++) {
            for (let month = 1; month <= 12; month++)
                try {
                    const response = await this.fetchNYTArchive(year, month);
                    console.log(`Fetched NYT Archive for year: ${year} month: ${month}`);
                    const articles = await this.parseNYTResponse(response, year);
                    console.log(`Parsed NYT Archive for year: ${year} month: ${month}`);
                    // console.log('Articles:', articles);
                    // console.log(Array.isArray(articles)); 
                    await this.storeArticlesInDB(articles, month);
                    console.log(`Stored NYT Archive for year: ${year} month: ${month}`);
                    

                }   catch(error) {
                    console.log('Error fetching NYT Archive:', error);
                    return {success: false, message: 'Failed Store NYT News'};
                }
            
        }
        return {success: true, message: 'Success Store NYT News'};
    }

    /* dID를 통해 재난 타입 가져오는 코드*/
    async getDisastersTypeBydID(dID: string): Promise<{ dType: string, dCountry: string, dDate: string }> {
        const getDisasterDetail =  await this.disasterDetailRepository
        .createQueryBuilder('disaster')
        .where('disaster.dID = :dID', { dID })
        .getOne();

        const dDate = getDisasterDetail.dDate;
        const dCountry = getDisasterDetail.dCountry;
        const dType = getDisasterDetail.dType;

        console.log('In getDisastersTypeBydID');
        console.log(`year: ${dDate}, country: ${dCountry}, dType: ${dType}`);

        // const articles = await this.getDisastersByCountryAndYearAndTypeAndID(country, year, dType, dID);

        return {
            dType: getDisasterDetail.dType,
            dCountry: getDisasterDetail.dCountry,
            dDate: getDisasterDetail.dDate,
        };
    }

    /* dType, country, year을 통해 필터링 */
    async getArticlesByCountryAndYearAndTypeAndID(country: string, year: string, dType: string, dID: string): Promise<NYTArchiveEntity[]> {
        /* headline_main,keywords_name, keyword_value, snippet dType, country가 포함되어있는 기사들을 dID를 포함시켜 저장 */
        /* API엔드포인트에서 year도 받아와서 pub_year가 year와 일치하는것까지 필터링 */
        /* 모두 일치하면 API 엔드포인트에 있는 dID 를 외래키로 저장 */

        const articles = await this.nytArchiveRepository
            .createQueryBuilder('article')
            .where('article.year = :year', { year })
            .andWhere('article.headline_main LIKE :dType', { dType: `%${dType}%` })
            .andWhere('article.headline_main LIKE :country', { country: `%${country}%` })
            .getMany();
        if (articles.length === 0) {
            // 에러 메시지 출력
            const errorMessage = `No articles found for year: ${year}, country: ${country}, type: ${dType}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        for (let article of articles) {
            article.dID = dID; // 각 기사에 dID 설정
            await this.nytArchiveRepository.save(article); // 갱신된 기사 저장
            console.log(`success save article ${article.headline_main}`);
        }
        
        return articles;
    }

    async getNewsByID(dID: string): Promise<NYTArchiveEntity[]> {
        console.log('In getNewsByID');
        const disasterTable = await this.getDisastersTypeBydID(dID);

        const dType = disasterTable.dType;
        const dDate = disasterTable.dDate;
        const country = disasterTable.dCountry;

        const articles = await this.getArticlesByCountryAndYearAndTypeAndID(dID, country, dDate, dType);
        if (!articles) {
            console.log('getNewsByID No articles found');
        }
        return articles;

    }

    async getDisastersID() {
        const result = await this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .select('disaster.dID')
            .where('disaster.dDate >= :date', { date : '2022-12-31' })
            .getMany();
        if(result.length === 0) {
            throw new Error('No disasters found after the specified date.');
        }
        return result;
    }
    //!SECTION Bing News API
    // async storeLiveArticle(dID: string, dDate: string, dType: string, dCountry: string) {
    //     const axios = require('axios');
    //     const apiKey = '2a25766d28854a45a21da9cd886bb9c9'; // 여기에 Bing API 키를 입력하세요.
    //     const searchQuery = `${dType} ${dCountry} ${dDate}`; // 검색하고 싶은 키워드를 입력하세요.
    //     const apiUrl = `https://api.bing.microsoft.com/v7.0/news/search?q=${encodeURIComponent(searchQuery)}&mkt=en-US&safeSearch=Moderate`;

    //     try {
    //         const response = await axios.get(apiUrl, {
    //             headers: { 'Ocp-Apim-Subscription-Key': apiKey }
    //         });

    //         const disasterDate = new Date(`${dDate}`);
    //         for (let n = 0; n < response.data.value.length; n++) {
                

    //             const headlineLower = response.data.value[n].name.toLowerCase();
    //             const description = response.data.value[n].description.toLowerCase();

    //             const isdTypeInName = headlineLower.includes(dType.toLowerCase());
    //             const isdTypeInDescription = description.includes(dType.toLowerCase());
    //             const isdCountryInName = headlineLower.includes(dCountry.toLowerCase());
    //             const isdCountryInDescription = description.includes(dCountry.toLowerCase());

    //             if (isdTypeInName && isdTypeInDescription && isdCountryInName && isdCountryInDescription && disasterDate <= new Date(response.data.value[n].datePublished)) {
    //                 const disasterDetail = await this.disasterDetailRepository.findOne({ where: {dID} });
    //                 const headline = response.data.value[n].name;
    //                 const url = response.data.value[n].url;
    //                 const liveArticle = new LiveArticleEntity();
    //                 liveArticle.headline = headline;
    //                 liveArticle.url = url;
    //                 liveArticle.disasterDetail = disasterDetail; // 할당

    //                 await this.liveArticleRepository.save(liveArticle);
    //                         console.log(`success save article ${headline}`);
    //                     }
    //             else{
    //                 console.log('No articles found');
    //             }
                
    //         }
    //     } catch (error) {
    //         console.error('Error fetching news:', error);
    //     }
    // }
    //!SECTION End Bing News API

    //!SECTION Mediastack API
    async storeLiveArticle(dID: string, dDate: string, dType: string, dCountry: string) {
        const axios = require('axios');
        const apiKey = '5057f1372fdc2004d02af923fdeff472'; // 여기에 Bing API 키를 입력하세요.
        const searchQuery = `${dType} ${dCountry}`; // 검색하고 싶은 키워드를 입력하세요.
        const disasterDetail = await this.disasterDetailRepository.findOne({ where: {dID} });
        const params = stringify({
            access_key: 'ACCESS_KEY', // 여기에 실제 액세스 키를 입력하세요
            category: '-general',
            sort: 'published_desc',
            keywords: searchQuery,
            date: dDate,
            limit: 5,
        });
        try 
        {
            const response = await axios.get(`http://api.mediastack.com/v1/news?${params}`);

            for (let n = 0; n < response.data.value.length; n++) 
            {
                const headline = response.data.value[n].title;
                const url = response.data.value[n].url;
                
                const liveArticle = new LiveArticleEntity();
                liveArticle.headline = headline;
                liveArticle.url = url;
                liveArticle.disasterDetail = disasterDetail; // 할당

                await this.liveArticleRepository.save(liveArticle);
                console.log(`success save article ${headline}`);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    }
    //!SECTION End Mediastack API

    

}
