import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CountryEntity {

    /* Basic Profile */

    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    cCode: string;

    @Column()
    cCountry: string;

    @Column({ nullable: true })
    cCountry_rw: string;

    @Column()
    cContinent: string; // "Map references"

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
