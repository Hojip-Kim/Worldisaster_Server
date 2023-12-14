import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique(['objectId'])
export class EmailAlertsEntity {

    @PrimaryGeneratedColumn()
    objectId: number;

    @Column({ nullable: false })
    alertEmail: string; // dto에 없이 로그인되면 자동 추가

    @Column({ nullable: false })
    alertCountryName: string;

    @Column({ nullable: false })
    alertDistrictName: string;

    @Column({ nullable: false, type: "float" })
    alertLatitude: number;

    @Column({ nullable: false, type: "float" })
    alertLongitude: number;

    @Column({ nullable: false })
    alertRadius: number;

    @Column({ nullable: false, default: false })
    alertLevelGreen: boolean;

    @Column({ nullable: false, default: false })
    alertLevelOrange: boolean;

    @Column({ nullable: false, default: false })
    alertLevelRed: boolean;

    @Column({ nullable: false })
    alertLatitudeMax: number; // dto에 없이 받아서 서버에서 생성/삽입

    @Column({ nullable: false })
    alertLatitudeMin: number; // dto에 없이 받아서 서버에서 생성/삽입

    @Column({ nullable: false })
    alertLongitudeMax: number; // dto에 없이 받아서 서버에서 생성/삽입

    @Column({ nullable: false })
    alertLongitudeMin: number; // dto에 없이 받아서 서버에서 생성/삽입

    @CreateDateColumn()
    createdAt: Date; // dto에 없이 받아서 서버에서 생성/삽입

}
