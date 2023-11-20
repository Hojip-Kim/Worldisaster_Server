import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class NYTArchiveEntity {
    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    web_url: string;

    @Column()
    snippet: string;

    @Column()
    headline_main: string;

    @Column()
    keywords_name: string;

    @Column()
    keywords_value: string;

    @Column()
    year: string;

    @Column()
    document_type: string;

    @Column()
    section_name: string;

    @Column()
    _id: string;

    /* foreign key */
    @Column({nullable: true})
    dID: string;
}