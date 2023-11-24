import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LiveArticleEntity } from './live_news.entity';
@Entity()
export class DisastersDetailEntity {

    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    dID: string;

    @Column()
    dStatus: string;

    @Column()
    dCountry: string;

    @Column()
    dCountryCode: string;

    @Column()
    dType: string;

    @Column()
    dDate: string;

    @Column({
        type: 'double precision',
        nullable: true
    })
    dLatitude: number;

    @Column({
        type: 'double precision',
        nullable: true
    })
    dLongitude: number;

    @Column()
    dTitle: string;

    @Column({ nullable: true })
    dDescription: string;

    @Column()
    dUrl: string;

    @OneToMany(() => LiveArticleEntity, liveArticle => liveArticle.disasterDetail)
    liveArticles: LiveArticleEntity[];

}