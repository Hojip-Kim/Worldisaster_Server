import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class NYTArchiveEntity {
    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    web_url: string;

    @Column({nullable: true})
    snippet: string;

    @Column()
    headline_main: string;

    @Column({nullable: true})
    keywords_name: string;

    @Column({nullable: true})
    keywords_value: string;

    @Column()
    year: string;

    @Column({nullable: true})
    document_type: string;

    @Column({nullable: true})
    section_name: string;

    @Column()
    _id: string;

    /* foreign key */
    @Column({nullable: true})
    dID: string;
}