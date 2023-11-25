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
}
