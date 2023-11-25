import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatEntity } from './chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity])],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController]
})
export class ChatModule { }

// Gateway를 통해서 Client 요청을 처리하게 됨
// Gateway는 Service를 호출해서 메시지를 DB에 저장
// Chat Entity를 통해서 메시지의 구조와 저장 형태를 명시
// 이 작업이 끝나면 Gateway는 같은 방의 타인들에게 메시지를 포워딩
// 과거 채팅 History는 Controller를 통해서 HTTP Request로 제공됨

// 브라우저에서 테스트 하려면 다음 코드 활용
// const socket = new WebSocket('ws://localhost:3000/chat'); 
// socket.onopen = () => {
//     const testMessage = {
//         chatSenderID: 1,
//         chatRoomID: 101,
//         chatMessage: "Hello Server!"
//     };
//     socket.send(JSON.stringify(testMessage)); // Send as a JSON string
// };
// socket.onmessage = (event) => console.log('Message from server:', event.data);
