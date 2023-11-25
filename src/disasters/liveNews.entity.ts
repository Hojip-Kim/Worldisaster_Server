import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DisastersDetailEntity } from './disasters-detail.entity';

@Entity()
export class LiveArticleEntity {
    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    headline: string;

    @Column()
    url: string;

    @ManyToOne(() => DisastersDetailEntity)
    @JoinColumn({ name: 'dID' , referencedColumnName: 'dID'}) // 여기서 dID는 DisastersDetailEntity의 dID 필드를 참조합니다
    disasterDetail: DisastersDetailEntity;

}