// src/country-mapping.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('country_mappings', { synchronize: false })
export class CountryMappings {

    @PrimaryColumn()
    code: string;

    @Column({ nullable: true })
    continent: string;

    @Column({ name: 'cia_name', nullable: true })
    cia_name: string;

    @Column({ name: 'rw_name', nullable: true })
    rw_name: string;

    @Column({ name: 'other_name', nullable: true })
    other_name: string;

}
