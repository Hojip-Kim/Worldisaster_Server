import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { DisastersList } from './disasters-list.entity';
import { DisastersDetailEntity } from './disasters-detail.entity';

import { HttpService } from '@nestjs/axios'; // HTTP 요청 라이브러리
import * as sanitizeHtml from 'sanitize-html'; // HTTP 태그 정리 라이브러리
import { Cron, CronExpression } from '@nestjs/schedule'; // 스케쥴링 라이브러리
import { firstValueFrom } from 'rxjs'; // 첫 요청을 promise로 돌려줌

// 새로운 재난이 발생하면 Push 해주는 웹소켓 등이 없으니, 주기적으로 리스트 확인이 필요함
@Injectable()
export class DisastersService {
    private baseUrl = 'https://api.reliefweb.int/v1/disasters?appname=apidoc&limit=1000';

    constructor(
        private httpService: HttpService, // HTTP 요청 라이브러리를 가져오고
        @InjectRepository(CountryMappings) // CountryMappings 테이블도 불러오고
        private countryMappingRepository: Repository<CountryMappings>,
        @InjectRepository(DisastersList) // 재난 목록 Entity의 리포지토리를 가져오고
        private disasterListRepository: Repository<DisastersList>,
        @InjectRepository(DisastersDetailEntity)
        private disasterDetailRepository: Repository<DisastersDetailEntity>,
    ) { }

    /* 여기서부터는 API에 대응하는 Service */

    // 모든 Disaster들을 호출하기
    async getAllDisasters(): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository.createQueryBuilder('disaster').getMany();
    }

    // 국가 단위의 Disaster들을 호출하기

    async getDisastersByCountryCode(countryCode: string): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountryCode = :countryCode', { countryCode })
            .getMany();
    }

    async getDisastersByCountryName(country: string): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountry = :country', { country })
            .getMany();
    }

    // 같은 국가 내에서 특정 연도에 발생한 Disaster들을 호출하기

    async getDisastersByCountryCodeAndYear(countryCode: string, year: string): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountryCode = :countryCode', { countryCode })
            .andWhere('SUBSTRING(disaster.dDate, 1, 4) = :year', { year })
            .getMany();
    }

    async getDisastersByCountryNameAndYear(country: string, year: string): Promise<DisastersDetailEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountry = :country', { country })
            .andWhere('SUBSTRING(disaster.dDate, 1, 4) = :year', { year })
            .getMany();
    }

    // async getDisastersByCountryCodeTypeAndYear(countryCode: string, type: string, year: string): Promise<DisastersDetailEntity[]> {
    //     return this.disasterDetailRepository
    //         .createQueryBuilder('disaster')
    //         .where('disaster.dCountryCode = :countryCode', { countryCode })
    //         .andWhere('disaster.dType = :type', { type })
    //         .andWhere('SUBSTRING(disaster.dDate, 1, 4) = :year', { year })
    //         .getMany();
    // }

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
}
