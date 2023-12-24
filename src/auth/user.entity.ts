import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class User extends BaseEntity {
    @Column({ nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    username: string; // username - (회원가입 추가 시)

    @Column({ nullable: true })
    password: string; // password - (회원가입 추가 시)

    @Column({ nullable: true })
    provider: string; // OAuth 제공자 - 예 : 'google'

    @Column({ nullable: true })
    providerId: string; // OAuth 제공자의 고유 ID

    @Column({ nullable: true })
    email: string; // 사용자 이메일

    @Column({ nullable: true })
    name: string; // 사용자 이름

    @Column({ nullable: true })
    hashedRefreshToken: string;

    @Column({ nullable: true, default: 'false' })
    subscriptionLevel_Green: string; // 구독 레벨

    @Column({ nullable: true, default: 'false' })
    subscriptionLevel_Orange: string; // 구독 레벨

    @Column({ nullable: true, default: 'false' })
    subscriptionLevel_Red: string; // 구독 레벨

    @Column({ nullable: true, default: 'all' })
    subscriptionCountry1: string; // 구독 국가

    @Column({ nullable: true, default: 'all' })
    subscriptionCountry2: string; // 구독 국가

    @Column({ nullable: true, default: 'all' })
    subscriptionCountry3: string; // 구독 국가
}