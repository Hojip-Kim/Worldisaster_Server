import { BaseEntity, Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm"
import { NewDisastersEntity } from "src/newDisasters/newDisasters.entity";
@Entity()
export class Video extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    video_url: string;

    @Column()
    video_name: string;

    @Column()
    approve: boolean;

    @Column()
    dID: string;
}