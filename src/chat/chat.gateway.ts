import {
  WebSocketGateway, // Class를 Websocket Gateway로 선언하는데 사용되는 Decorator들
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  /* 웹소켓 서버 인스턴스 생성 */
  @WebSocketServer() chatServer: Server;

  /* 채팅 서비스에 필요한 함수/기능들 Import */
  constructor(private chatService: ChatService) { }

  /* 새로운 연결이 생성되면 Trigger */
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('connection', 'Successfully connected to server'); // Client는 'connection' 이벤트를 기다리도록 구성

    // 추후 AUTH를 연결하게 되면 연결 요청에 토큰 정보를 보내게 되며, 
    // 그 정보를 여기서 활용해서 인증 / 거부 등을 처리하면 됨
    // 최초 연결 시에만 인증하는게 맞으니 여기서 처리
  }

  /* Client들에 의한 "Message"를 구독 (메시지 발생 시 Trigger) */
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: {
    chatSenderID: string;
    chatRoomID: string;
    chatMessage: string
  }): Promise<void> {
    const chat = await this.chatService.createMessage(payload);
    this.chatServer.emit('newMessage', chat); // Client들은 'newMessage' 이벤트 발생 시 해당 내용을 받아가도록 구성
  }

  /* 기존 연결이 끊기면 Trigger */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // 연결이 끊기는 경우, 예컨대 Live 상태를 Offline으로 바꾸는 등 여기서 처리
  }
}
