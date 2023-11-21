import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DisastersDetailEntity {

    @Column()
    to_display: boolean;

    @PrimaryGeneratedColumn()
    objectId: number;

    @Column()
    dID: string;

    @Column()
    dStatus: string;

    @Column()
    dCountry: string;
    
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

}