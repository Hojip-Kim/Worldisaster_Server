import { BaseEntity, Column, Decimal128, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class Payment extends BaseEntity {
    @Column({ nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true})
    paymentId: string;
    
    @Column({ nullable: true})
    payerId: string;

    @Column({ nullable: true })
    dId: string;

    @Column({ nullable: true })
    useremail: string;

    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    country: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount: number;

    @Column({ nullable: true })
    currency: string; // 화폐 단위 (예: 'USD')

    @Column({ nullable: true })
    transactionId: string; // PayPal 트랜잭션 ID

    @Column({ nullable: true })
    status: string; // 결제 상태 (예: 'pending', 'completed', 'cancelled')

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // 생성 시간

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date; // 업데이트 시간

}