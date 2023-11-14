import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DisastersListEntity {
    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    dID: string;

    @Column()
    dTitle: string;

    @Column()
    dApiUrl: string;
}
