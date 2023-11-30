import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LiveNewsEntity } from '../liveNews/liveNews.entity';

@Entity()
export class OldDisastersEntity {

    @PrimaryGeneratedColumn()
    objectId: number;

    @Column({unique: true})
    dID: string;

    @Column()
    dSource: string;

    @Column()
    dStatus: string;

    @Column()
    dCountry: string;

    @Column({ nullable: true })
    dDistrict: string; // 작업용 필드 (별도 파악)

    @Column()
    dCountryCode: string;

    @Column({
        type: 'double precision',
        nullable: true
    })
    dCountryLatitude: number;

    @Column({
        type: 'double precision',
        nullable: true
    })
    dCountryLongitude: number;

    @Column()
    dType: string;

    @Column()
    dDate: string;

    @Column({
        type: 'double precision',
        nullable: true
    })
    dLatitude: number; // 작업용 필드 (별도 파악)

    @Column({
        type: 'double precision',
        nullable: true
    })
    dLongitude: number; // 작업용 필드 (별도 파악)

    @Column()
    dTitle: string;

    @Column({ nullable: true }) // 작업용 필드 (별도 파악)
    dSummary: string;

    @Column({ nullable: true })
    dDescription: string;

    @Column()
    dUrl: string;

    // 아래 10종은 전부 작업용 필드 (별도 파악)
    @Column({ nullable: true })
    news1title: string;

    @Column({ nullable: true })
    news1url: string;

    @Column({ nullable: true })
    news2title: string;

    @Column({ nullable: true })
    news2url: string;

    @Column({ nullable: true })
    news3title: string;

    @Column({ nullable: true })
    news3url: string;

    @Column({ nullable: true })
    news4title: string;

    @Column({ nullable: true })
    news4url: string;

    @Column({ nullable: true })
    news5title: string;

    @Column({ nullable: true })
    news5url: string;

    //NOTE - LiveNewsEntity와의 관계 설정
    @OneToMany(() => LiveNewsEntity, liveArticle => liveArticle.disasterDetail)
    liveArticles: LiveNewsEntity[];
}
