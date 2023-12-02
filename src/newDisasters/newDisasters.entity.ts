import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LiveNewsEntity } from '../liveNews/liveNews.entity';
import { Video } from 'src/upload/video.entity';
@Entity()
export class NewDisastersEntity {

    @PrimaryGeneratedColumn()
    objectId: number;

    @Column({ unique: true })
    dID: string;

    @Column()
    dSource: string;

    @Column()
    dStatus: string;

    @Column()
    dAlertLevel: string;

    @Column({ nullable: true })
    dSeverity: string; // 화산 폭발 (VO)에는 Severity 정보가 제공되지 않음

    @Column({ nullable: true })
    dCountry: string;

    @Column({ nullable: true })
    dCountryCode: string;

    @Column({ nullable: true })
    dCountryIso3: string; // International Territories에서 발생하는 재난은 국가 코드가 제공되지 않음

    @Column()
    dType: string;

    @Column()
    dTypeCode: string;

    @Column()
    dDate: string;

    @Column({
        type: 'double precision',
    })
    dLatitude: number;

    @Column({
        type: 'double precision',
    })
    dLongitude: number;

    @Column()
    dTitle: string;

    @Column()
    dDescription: string;

    @Column()
    dUrl: string;

}
