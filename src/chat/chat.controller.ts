import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) { }

    /* 특정 채팅방 번호를 토대로 모든 채팅 히스토리를 불러오는 API */
    @Get('room/:chatRoomID')
    async getMessages(@Param('chatRoomID') chatRoomID: string) {
        console.log("\nAPI : GET call made to fetch entire chat history...");
        return this.chatService.getMessagesByRoom(chatRoomID);
    }

    /* 채팅방 이름/번호를 토대로 지난 12시간 사이의 채팅 히스토리를 불러오는 API */
    @Get('room/:chatRoomID/12H')
    async get12hMessages(@Param('chatRoomID') chatRoomID: string) {
        console.log("\nAPI : GET call made to fetch 12 hour chat history...");
        return this.chatService.get12hMessagesByRoom(chatRoomID);
    }
}
