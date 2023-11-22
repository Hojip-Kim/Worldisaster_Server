import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ChatEntity {
    @PrimaryGeneratedColumn()
    chatMessageID: number;

    @Column()
    chatSenderID: string;  // 추후 고객 ID 또는 식별자로 교체 필요 (UUID) // 우선 String으로 가는데, 숫자가 더 효율적이긴 함 (User 엔티티 고려해서 결정 필요)

    @Column()
    chatRoomID: string;   // 방 번호 ; 정책 필요

    @Column('text')
    chatMessage: string;

    @CreateDateColumn()
    createdAt: Date;
}
