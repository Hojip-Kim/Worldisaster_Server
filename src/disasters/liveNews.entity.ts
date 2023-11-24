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
    @JoinColumn({name: 'dID'})
    disasterDetail: DisastersDetailEntity;

}