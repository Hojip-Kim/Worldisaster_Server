import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class User extends BaseEntity {
    @Column({ nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    provider: string; // OAuth 제공자 - 예 : 'google'

    @Column({ nullable: true })
    providerId: string; // OAuth 제공자의 고유 ID

    @Column({ nullable: true })
    email: string; // 사용자 이메일

    @Column({ nullable: true })
    name : string; // 사용자 이름

    @Column({ nullable: true })
    hashedRefreshToken: string;
}