import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OldDisastersEntity } from '../oldDisasters/oldDisasters.entity';

@Entity()
export class LiveNewsEntity {
    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    headline: string;

    @Column()
    url: string;

    @Column({ nullable: true })
    image: string;

    @Column()
    author: string;


    @ManyToOne(() => OldDisastersEntity)
    @JoinColumn({ name: 'dID' , referencedColumnName: 'dID'}) // 여기서 dID는 DisastersDetailEntity의 dID 필드를 참조합니다
    disasterDetail: OldDisastersEntity;

}