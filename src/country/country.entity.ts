import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CountryEntity {

    /* Basic Profile */

    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    cCode: string; // 국가정보 검색에 활용되는 두글자 코드 (CIA 기준)

    @Column({ nullable: true })
    cIso3: string; // 글로벌리 통용되는 세글자 국가 코드 (UN, EU 등)

    @Column()
    cCountry: string; // 기본적으로 통용되는 국가 이름 (CIA 기준)

    @Column({ nullable: true })
    cCountry_rw: string; // ReliefWeb에서 사용되는 국가 이름

    @Column({ nullable: true })
    cCountry_other: string; // 기타 자주 불리우는 이름, 또는 일부 식민지 이름일 경우 해당

    @Column({ nullable: true })
    cCountry_wiki: string; // 위키피디아에서 검색되는 이름

    @Column({ nullable: true })
    cCountry_official: string; // 법적으로 본인들이 희망하는 공식 이름

    @Column()
    cContinent: string; // CIA 2글자 코드와 함께 API 호출에 활용되는 값

    @Column({ nullable: true })
    cTimeDifference: string; // "Government" - "Capital" - "time difference"

    /* Geography */

    @Column({ nullable: true })
    cLocation: string; // "Location"

    @Column({ nullable: true })
    cGeoCoordinates: string; // "Geometric coordinates"

    @Column({ nullable: true })
    cSize: string; // "Area" - "total"

    /* Environment */

    @Column({ nullable: true })
    cClimate: string; // "Environment" - "Climate"

    @Column({ nullable: true })
    cNaturalHazards: string; // "Natural hazards"

    @Column({ nullable: true })
    cEnvironmentalIssues: string; // "Environment" - "Environment - current issues"

    /* People and Society information */

    @Column({ nullable: true })
    cPopulation: string; // "Population"

    @Column({ nullable: true })
    cPopulationDistribution: string; // "Population distribution"

    @Column({ nullable: true })
    cUrbanPopulation: string; // "Urbanization" - "urban population"

    @Column({ nullable: true })
    cUrbanRate: string; // "Urbanization" - "rate of urbanization"

    @Column({ nullable: true })
    cMajorUrbanPopulation: string; // "Major urban ares - population"

    /* Government  */

    @Column({ nullable: true })
    cCountryOfficialName: string; // "Government" - "Country name" - "conventional long form"

    @Column({ nullable: true })
    cCapitalName: string; // "Government" - "Capital" - "name"

    @Column({ nullable: true })
    cCapitalCoordinates: string; // "Government" - "Capital" - "geographic coordinates"

    @Column({ nullable: true })
    cGovernmentType: string; // "Government" - "Government type"

    /* Economy  */

    @Column({ nullable: true })
    cEconomicOverview: string; // "Economy" - "Economic overview"

    @Column({ nullable: true })
    cGDP: string; // "Economy" - "GDP (official exchange rate)"

    @Column({ nullable: true })
    cRealGDPPerCapita: string; // "Economy" - "Real GDP per capita" - *somerandomfield*

}
