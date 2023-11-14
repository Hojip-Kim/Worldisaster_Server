import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DisastersListEntity } from './disasters-list.entity';
import { DisasterDetailEntity } from './disasters-detail.entity';

import { HttpService } from '@nestjs/axios'; // HTTP 요청 라이브러리
import * as sanitizeHtml from 'sanitize-html';
import { Cron, CronExpression } from '@nestjs/schedule'; // 스케쥴링 라이브러리
import { firstValueFrom } from 'rxjs'; // 첫 요청을 promise로 돌려줌

// 새로운 재난이 발생하면 Push 해주는 웹소켓 등이 없으니, 주기적으로 리스트 확인이 필요함
@Injectable()
export class DisastersListService {
    private baseUrl = 'https://api.reliefweb.int/v1/disasters?appname=apidoc&limit=1000';

    constructor(
        private httpService: HttpService, // HTTP 요청 라이브러리를 가져오고
        @InjectRepository(DisastersListEntity) // 재난 목록 Entity의 리포지토리를 가져오고
        private disasterListRepository: Repository<DisastersListEntity>,
        @InjectRepository(DisasterDetailEntity)
        private disasterDetailRepository: Repository<DisasterDetailEntity>,
    ) { }

    async fetchAndCompareCount(): Promise<{ success: boolean }> {

        // API에서 'count' 필드를 추출
        const apiResponse = await firstValueFrom(this.httpService.get(this.baseUrl));
        const countFromApi = apiResponse.data.totalCount;

        // DB에서 entity 개수를 확인
        const countInDb = await this.disasterListRepository.count();

        // 두개를 비교해서, 차이가 난다면 fetchAndStoreAllDisasters() 호출
        if (countFromApi !== countInDb) {
            await this.fetchAndStoreAllDisasters();
            return { success: true };
        }

        // 숫자가 맞으니 굳이 업데이트 필요 없음 + forceRefresh를 위한 리턴값
        return { success: false };
    }

    async fetchAndStoreAllDisasters() {

        // ReliefWeb 구조를 참고, currentUrl 변수를 바꿔가면서 활용
        let currentUrl = this.baseUrl;

        // 각각의 1000개 단위 리스트를 배열에 저장하기 위함
        const allEntries = [];

        // 순회하면서 값들을 배열에 저장
        while (currentUrl) {
            const response = await firstValueFrom(this.httpService.get(currentUrl));
            allEntries.push(...response.data.data); // 각 배열 요소를 넣기 위해서 Spread Operator 사용

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
            console.log('최초 재난 리스트 추출 시 DB 리셋 실패');
            throw new Error('Failed in updating the list of disasters');
        }

        // 인자로 전달받은 배열을 삽입할 수 있도록 준비 (Response 구조를 정리)
        // flatMap은 배열의 각 요소에 대하여 Map을 실행하고 Flatten 해서 반환
        const allEntries = entries.map(entry => ({
            dID: entry.id,
            dTitle: entry.fields.name,
            dApiUrl: entry.href
        }));

        // 결과물을 삽입 (typeORM save()는 배열도 처리할 수 있음 for bulk handling)
        try {
            await this.disasterListRepository.save(allEntries);
            console.log('New or updated disaster lists saved successfully');

        } catch (error) {
            console.error('Error saving to PostgreSQL:', error);
            throw error;
        }
    }

    async fetchAndSaveDisasterDetails(rawEntries: any[]) {

        // 먼저 앞서 저장한 DB에서 저장된 값들을 다 빼와서 배열에 저장하고, 거기서 dID의 Set를 생성
        const existingDbDetails = await this.disasterDetailRepository.find();
        const existingdIDs = new Set(existingDbDetails.map(detail => detail.dID));

        // rawEntries 배열을 필터링 (DB에 매칭되는 DID가 없는 경우)
        const newEntries = rawEntries.filter(entry => !existingdIDs.has(entry.id));
        if (newEntries.length == 0) {
            console.log('Detail을 저장하는 로직에 문제가 있음');
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

                // 개별 엔티티 생성
                const detail = new DisasterDetailEntity();
                detail.dID = fields.id;
                detail.dStatus = fields.status;
                detail.dCountry = fields.primary_country.name;
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

                // 프론트를 위한 항목 (to_display로 요소 제어)
                if (detail.dLatitude !== null || detail.dLatitude !== null || detail.dCountry == 'World') {
                    detail.to_display = true;
                } else {
                    detail.to_display = false;
                }

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

    // 매 시간마다 여기서 함수가 시작, fetchAndCompareCount를 실행
    @Cron(CronExpression.EVERY_HOUR)
    handleCron() {
        this.fetchAndCompareCount();
    }
}
