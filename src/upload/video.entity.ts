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

    @ManyToOne(() => NewDisastersEntity)
    @JoinColumn({ name: 'dID' , referencedColumnName: 'dID'}) // 여기서 dID는 NewDisastersEntity dID 필드를 참조합니다
    disasterDetail: NewDisastersEntity;
}