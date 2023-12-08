import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ArchiveNewsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    topic: string;

    @Column({nullable: true})
    headline: string;

    @Column({ type: 'text'})
    url: string;

    @Column()
    dID: string;

    
}