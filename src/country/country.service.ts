import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CountryEntity } from './country.entity';
import { CountryMappings } from './script_init/country-table.entity';

import { HttpService } from '@nestjs/axios'; // HTTP 요청 라이브러리
import * as sanitizeHtml from 'sanitize-html'; // HTTP 태그 정리 라이브러리
import { Cron, CronExpression } from '@nestjs/schedule'; // 스케쥴링 라이브러리
import { firstValueFrom } from 'rxjs'; // 첫 요청을 promise로 돌려줌

@Injectable()
export class CountryService {

    // Disaster 모듈과 다르게 logger를 통해서 에러 메시지 확인
    private readonly logger = new Logger(CountryService.name);

    // Express.js로 만든 CountryMapping 테이블 참고를 위해서 script_init 폴더에 전용 entity.ts 생성 후 활용
    constructor(
        @InjectRepository(CountryEntity)
        private countryRepository: Repository<CountryEntity>,
        @InjectRepository(CountryMappings)
        private countryMappingRepository: Repository<CountryMappings>,
        private httpService: HttpService
    ) { }

    /* 여기서부터는 API에 대응하는 Service */

    async getCountryByCode(countryCode: string): Promise<CountryEntity> {

        // 한번 찾아보고
        let found = await this.countryRepository.findOneBy({ cCode: countryCode });

        // 못찾으면 에러 반환
        if (!found) {
            throw new NotFoundException(`Can't find country with code ${countryCode}`);
        }

        return found;
    }

    async getCountryByName(countryName: string): Promise<CountryEntity> {

        // 먼저 cia_name으로 저장된 cCountry부터 검색
        let found = await this.countryRepository.findOneBy({ cCountry: countryName });

        // 없다면 rw_name으로 저장된 cCountry_rw 검색
        if (!found) {
            found = await this.countryRepository.findOneBy({ cCountry_rw: countryName });
        }

        // 없다면 other_name도 탐색
        if (!found) {
            found = await this.countryRepository.findOneBy({ cCountry_other: countryName });
        }

        // 끝까지 못찾으면 에러 반환
        if (!found) {
            throw new NotFoundException(`Can't find country with name ${countryName}`);
        }

        return found;
    }


    async getAllCountries(): Promise<CountryEntity[]> {

        return this.countryRepository.createQueryBuilder('country').getMany();
    }

    /* 여기서부터는 주기적으로 데이터를 갱신해주는 역할 */

    // (1) CountryMaping 테이블 엔트리를 하나씩 순회하면서 처리하도록 구성
    async updateCountryProfiles(): Promise<{ success: boolean, message: string }> {

        const countryMappings = await this.countryMappingRepository.find();
        if (!countryMappings) {
            console.log("No country mapping table found");
        }

        for (const mapping of countryMappings) {
            await this.fetchAndUpdateCountryProfile(mapping);
        }

        return { success: true, message: "Updated all country profiles successfully" };
    }

    // (2) 위에서 For문을 통해 각 Country Code 엔트리마다 작업 수행
    private async fetchAndUpdateCountryProfile(mapping: CountryMappings): Promise<void> {

        const { code, continent, cia_name, rw_name, other_name } = mapping;

        // Helper 함수를 통해서 api URL 생성
        const apiUrl = this.constructApiUrl(continent, code);
        if (!apiUrl) {
            console.log("No country found for:", apiUrl);
        }

        try {
            const response = await firstValueFrom(this.httpService.get(apiUrl));

            // Helper 함수를 통해서 데이터 파싱 및 저장
            await this.processAndSaveCountryData(code, cia_name, rw_name, other_name, response.data);

        } catch (error) {

            this.logger.error(`Error fetching data for ${cia_name}: ${error}`);

        } // 기본적으로 ciaName을 사용하되, 없으면 rwName을 사용해보는 구조
    }

    private constructApiUrl(continent: string, countryName: string): string {
        return `https://raw.githubusercontent.com/factbook/factbook.json/master/${continent}/${countryName}.json`;
    }

    // (3) 각 countryTable 엔트리마다 조회 결과를 포맷해서 테이블에 저장
    private async processAndSaveCountryData(countryCode: string, cia_name: string, rw_name: string, other_name: string, countryData: any): Promise<void> {

        // 인자로 전달받은 국가 이름에 맞는 Entry를 삭제
        const del_result = await this.countryRepository.delete({ cCountry: cia_name });
        if (del_result.affected === 0) {
            this.logger.warn(`No existing country found for deletion: ${cia_name}`);
        }

        // 인자로 전달받은 배열을 삽입할 수 있도록 준비 (Response 구조를 정리)
        const profile = new CountryEntity();
        profile.cCode = countryCode;
        profile.cCountry = cia_name;
        profile.cCountry_rw = rw_name ?? null;
        profile.cCountry_other = other_name ?? null;
        profile.cContinent = countryData.Geography['Map references']?.text ?? null; // "Map references"
        profile.cTimeDifference = countryData.Government?.Capital?.['time difference']?.text ?? null; // "Government" - "Capital" - "time difference"

        profile.cLocation = countryData.Geography?.Location?.text ?? null; // "Location"
        profile.cGeoCoordinates = countryData.Geography?.['Geographic coordinates']?.text ?? null; // "Geographic coordinates"
        profile.cSize = countryData.Geography?.Area?.total?.text ?? null; // "Area" - "total"

        profile.cClimate = countryData.Environment?.Climate?.text ?? null; // "Environment" - "Climate"
        profile.cNaturalHazards = countryData.Geography?.['Natural hazards']?.text ?? null; // "Natural hazards"
        profile.cEnvironmentalIssues = countryData.Environment?.['Environment - current issues']?.text ?? null; // "Environment" - "Environment - current issues"

        profile.cPopulation = countryData['People and Society']?.Population?.text ?? null; // "Population"
        profile.cPopulationDistribution = countryData['People and Society']?.['Population distribution']?.text ?? null; // "Population distribution"
        profile.cUrbanPopulation = countryData['People and Society']?.Urbanization?.['urban population']?.text ?? null; // "Urbanization" - "urban population"
        profile.cUrbanRate = countryData['People and Society']?.Urbanization?.['rate of urbanization']?.text ?? null; // "Urbanization" - "rate of urbanization"
        profile.cMajorUrbanPopulation = countryData['People and Society']?.['Major urban areas - population']?.text ?? null; // "Major urban areas - population"

        profile.cCountryOfficialName = countryData.Government?.['Country name']?.['conventional longform']?.text ?? null; // "Government" - "Country name" - "conventional long form"
        profile.cCapitalName = countryData.Government?.Capital?.name?.text ?? null; // "Government" - "Capital" - "name"
        profile.cCapitalCoordinates = countryData.Government?.Capital?.['geographic coordinates']?.text ?? null; // "Government" - "Capital" - "geographic coordinates"
        profile.cGovernmentType = countryData.Government?.['Government type']?.text ?? null; // "Government" - "Government type"

        profile.cEconomicOverview = countryData.Economy?.['Economic overview']?.text ?? null; // "Economy" - "Economic overview"
        profile.cGDP = countryData.Economy?.['GDP (official exchange rate)']?.text ?? null; // "Economy" - "GDP (official exchange rate)"
        profile.cRealGDPPerCapita = this.parseRealGDPPerCapita(countryData.Economy?.['Real GDP per capita']); // "Economy" - "Real GDP per capita"

        await this.countryRepository.save(profile);

    }

    // GDP 데이터로 가는 JSON Path 중간에 계속 바뀌는 값이 있어 처리
    private parseRealGDPPerCapita(realGDPData: any): string {
        if (!realGDPData || typeof realGDPData !== 'object' || Object.keys(realGDPData).length === 0) {
            return null;
        }

        const key = Object.keys(realGDPData)[0];
        return realGDPData[key]?.text ?? null;
    }

    // 정해진 시간마다 여기서 함수가 시작, updateCountryProfiles()를 실행
    @Cron(CronExpression.EVERY_WEEK)
    async handleCron() {
        console.log("Regular 1-week interval API Request made to fetch/update country profiles");
        await this.updateCountryProfiles();
    }
}