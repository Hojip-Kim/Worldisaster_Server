import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) { }

    /* 특정 채팅방 번호를 토대로 모든 채팅 히스토리를 불러오는 API */
    @Get('room/:chatRoomID')
    async getMessages(@Param('chatRoomID') chatRoomID: string) {
        return this.chatService.getMessagesByRoom(chatRoomID);
    }
}
