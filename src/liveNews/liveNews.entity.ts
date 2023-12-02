import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Collection } from 'typeorm';
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

    @Column({ nullable: true })
    author: string;


    @Column()
    dID: string;

}