import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { OldDisastersEntity } from './oldDisasters.entity';

import { HttpService } from '@nestjs/axios'; // HTTP 요청 라이브러리
import * as sanitizeHtml from 'sanitize-html'; // HTTP 태그 정리 라이브러리
import { Cron, CronExpression } from '@nestjs/schedule'; // 스케쥴링 라이브러리
import { firstValueFrom } from 'rxjs'; // 첫 요청을 promise로 돌려줌

// 새로운 재난이 발생하면 Push 해주는 웹소켓 등이 없으니, 주기적으로 리스트 확인이 필요함
@Injectable()
export class OldDisastersService {
    private baseUrl = 'https://api.reliefweb.int/v1/disasters?appname=apidoc&limit=1000';

    constructor(
        private httpService: HttpService, // HTTP 요청 라이브러리를 가져오고
        @InjectRepository(CountryMappings) // CountryMappings 테이블도 불러오고
        private countryMappingRepository: Repository<CountryMappings>,
        @InjectRepository(OldDisastersEntity)
        private disasterDetailRepository: Repository<OldDisastersEntity>,
    ) { }

    /* 여기서부터는 API에 대응하는 Service */

    async getAllDisasters(): Promise<OldDisastersEntity[]> {
        return this.disasterDetailRepository.createQueryBuilder('disaster').getMany();
    }

    async getDisastersByCountryCode(countryCode: string): Promise<OldDisastersEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountryCode = :countryCode', { countryCode })
            .getMany();
    }

    async getDisastersByCountryName(country: string): Promise<OldDisastersEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountry = :country', { country })
            .getMany();
    }

    async getDisastersByCountryCodeAndYear(countryCode: string, year: string): Promise<OldDisastersEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountryCode = :countryCode', { countryCode })
            .andWhere('SUBSTRING(disaster.dDate, 1, 4) = :year', { year })
            .getMany();
    }

    async getDisastersByCountryNameAndYear(country: string, year: string): Promise<OldDisastersEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('disaster.dCountry = :country', { country })
            .andWhere('SUBSTRING(disaster.dDate, 1, 4) = :year', { year })
            .getMany();
    }

    async getDisastersByYear(year: string): Promise<OldDisastersEntity[]> {
        return this.disasterDetailRepository
            .createQueryBuilder('disaster')
            .where('SUBSTRING(disaster.dDate, 1, 4) = :year', { year })
            .getMany();
    }

    /* 여기서부터는 처음에 데이터를 로드해주는 역할 (서버 최초 세팅시 3-4번만 수행하면 충분) */

    async fetchAndStoreAllDisasters() {

        // ReliefWeb 구조를 참고, currentUrl 변수를 바꿔가면서 활용
        let currentUrl = this.baseUrl;

        // 각각의 1000개 단위 리스트를 배열에 저장하기 위해 우선 set으로 정의 (API 결과에 duplicate들이 있음)
        const allEntries = [];
        const uniqueIds = new Set();

        // ReliefWeb API가 중복값을 뱉기도 해서, 순회하면서 값들을 Set에 저장하는 식으로 처리 -> 서버 첫 구동 후 사이클이 3-4번 돌면 중복없이 완전해짐
        while (currentUrl) {
            const response = await firstValueFrom(this.httpService.get(currentUrl));
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

            try {
                await this.fetchAndSaveRwDisasterDetails(allEntries);
                return { success: true, message: 'Updated (ReliefWeb Disasters)' };
            } catch (error) {
                console.log('@ Disaster Auto Update Failed: ' + error.message);
                return { success: false, message: 'Update Failed (ReliefWeb Disasters)' };
            }
        }
    }

    async fetchAndSaveRwDisasterDetails(rawEntries: any[]) {

        // 먼저 앞서 저장한 DB에서 저장된 값들을 다 빼와서 배열에 저장하고, 거기서 dID의 Set를 생성
        const existingDbDetails = await this.disasterDetailRepository.find();
        const existingdIDs = new Set(existingDbDetails.map(detail => detail.dID));

        // rawEntries 필터 : DB에 매칭되는 DID가 없는 경우에만 API 콜 실행
        const newEntries = rawEntries.filter(entry => !existingdIDs.has(entry.id));
        if (newEntries.length == 0) {
            console.log('No new entries to update');
            return;
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
                    return; // fields 섹션이 없으면 데이터에 문제가 있다는 뜻이니, 해당 Entry만 건너뛰기
                }
                const fields = responseData.fields;

                // rawEntries 2차 필터 : 2000년 1월 1일 이전의 데이터는 취급 않을 예정이니 저장할 필요 없음
                const cutoffDate = new Date("2000-01-01T00:00:00+00:00");
                const entryDate = new Date(fields.date.event.split('T')[0]);
                if (entryDate < cutoffDate) {
                    return;
                }

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
                const detail = new OldDisastersEntity();
                detail.dID = fields.id;
                detail.dSource = 'ReliefWeb';
                detail.dStatus = 'past';
                detail.dCountry = fields.primary_country.name;
                detail.dDistrict = null; // 작업용 필드 (별도 파악)
                detail.dCountryCode = countryEntityCode;

                // 국가 위도 경도 표시 (ReliefWeb 위도 경도는 국가 위치)
                if (fields.primary_country && fields.primary_country.location) {
                    detail.dCountryLatitude = fields.primary_country.location.lat;
                    detail.dCountryLongitude = fields.primary_country.location.lon;
                } else {
                    detail.dCountryLatitude = null;
                    detail.dCountryLongitude = null;
                }

                // 재난 타입, 날짜, 제목, 설명 등
                detail.dType = fields.primary_type.name;
                const rawDate = new Date(fields.date.event);
                detail.dDate = rawDate.toISOString().split('T')[0];

                detail.dLatitude = null; // 작업용 필드 (별도 파악)
                detail.dLongitude = null; // 작업용 필드 (별도 파악)
                detail.dTitle = fields.name;
                detail.dSummary = null; // 작업용 필드 (dDescription 요약)

                // HTML Tag/Attribute 제거
                detail.dDescription = fields.description ? sanitizeHtml(fields.description, {
                    allowedTags: [],
                    allowedAttributes: {},
                }) : null;

                detail.dUrl = fields.url; // 작업용 필드 (별도 추가)
                detail.news1title = null; // 작업용 필드 (별도 추가)
                detail.news1url = null; // 작업용 필드 (별도 추가)
                detail.news2title = null; // 작업용 필드 (별도 추가)
                detail.news2url = null; // 작업용 필드 (별도 추가)
                detail.news3title = null; // 작업용 필드 (별도 추가)
                detail.news3url = null; // 작업용 필드 (별도 추가)
                detail.news4title = null; // 작업용 필드 (별도 추가)
                detail.news4url = null; // 작업용 필드 (별도 추가)
                detail.news5title = null; // 작업용 필드 (별도 추가)
                detail.news5url = null; // 작업용 필드 (별도 추가)

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

    // (Deprecated)
    // @Cron(CronExpression.EVERY_MINUTE)
    // async handleCron() {
    //     console.log("\n@ Disaster Auto Update Started - Regular 1-minute API Request made to fetch Disasters");
    //     await this.fetchAndCompareCount();
    // }
}