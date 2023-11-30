import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NewDisastersEntity } from '../newDisasters/newDisasters.entity';
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


    @ManyToOne(() => NewDisastersEntity)
    @JoinColumn({ name: 'dID' , referencedColumnName: 'dID'}) // 여기서 dID는 NewDisastersEntity dID 필드를 참조합니다
    disasterDetail: NewDisastersEntity;

}