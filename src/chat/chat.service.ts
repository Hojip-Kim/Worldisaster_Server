import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from './chat.entity';

@Injectable()
export class ChatService {
    constructor(@InjectRepository(ChatEntity) private chatRepository: Repository<ChatEntity>) { }

    /* 실제 메시지의 생성 및 저장을 위해 활용 (Gateway) */
    async createMessage(chatData: {
        chatSenderID: string;
        chatRoomID: string;
        chatMessage: string
    }): Promise<ChatEntity> {
        const chat = this.chatRepository.create(chatData);
        return this.chatRepository.save(chat);
    }

    /* 외부 API 요청에 대응하는 함수 (Controller) */
    async getMessagesByRoom(chatRoomID: string): Promise<ChatEntity[]> {
        return this.chatRepository.find({ where: { chatRoomID } });
    }

    async get12hMessagesByRoom(chatRoomID: string): Promise<ChatEntity[]> {

        // 현재 시간을 기준으로 12시간 전을 확인하고 (UTC),
        const now = new Date(new Date().toUTCString());
        const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));

        // 지정된 채팅방에서 12H를 불러와서 리턴
        const result = await this.chatRepository
            .createQueryBuilder('chatHistory')
            .where('chatHistory.chatRoomID = :chatRoomID', { chatRoomID })
            .andWhere('chatHistory.createdAt >= :twelveHoursAgo', { twelveHoursAgo: twelveHoursAgo.toISOString() })
            .getMany();

        return result;
    }

}
