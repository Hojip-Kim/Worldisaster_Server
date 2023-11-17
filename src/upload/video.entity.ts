import { BaseEntity, Column, PrimaryGeneratedColumn, Entity } from "typeorm"
@Entity()
export class Video extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    video_url: string;

    @Column()
    video_name: string;
}