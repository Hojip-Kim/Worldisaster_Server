import {
  WebSocketGateway, // Class를 Websocket Gateway로 선언하는데 사용되는 Decorator들
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

/* 기본적인 욕설 필터 (단, 영어만 지원..) */
import * as BadWordsFilter from "badwords-ko";
import { koreanProfanities } from './profanities/korean.profanities';

const filter = new BadWordsFilter({
  regex: /\*|\.|$/gi, // 특수기호로 욕설 우회를 방지 (감지)
  replaceRegex: /[A-Za-z0-9가-힣_]/g // 한국어도 허용
});
filter.addWords(...koreanProfanities); // 한국어 비속어 array 추가

/* 웹소켓 게이트웨이 */
@WebSocketGateway({
  namespace: 'chats',
  cors: {
    origin: '*', // main.ts에서 해줬지만, 웹소켓은 별도 인터페이스라서 다시 허용해줘야 함
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  /* 웹소켓 서버 인스턴스 생성 */
  @WebSocketServer() chatServer: Server;

  /* 채팅 서비스에 필요한 함수/기능들 Import */
  constructor(private chatService: ChatService) { }

  /* 현재 연결된 유저 수 관리 */
  private numberOfConnectedClients = 0;

  /* 새로운 연결이 생성되면 Trigger */
  handleConnection(client: Socket) {
    this.numberOfConnectedClients++;
    console.log(`\nChat Websocket Subscribers: ${this.numberOfConnectedClients} (New connection by '${client.id}')`);
  }

  /* Client가 특정 Room을 조인하는 경우를 처리 */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, room: string): Promise<void> {
    client.join(room);
  }

  /* 서버가 Client들에 의한 "Message"를 구독 (메시지 발생 시 Trigger) */
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { chatSenderID: string; chatRoomID: string; chatMessage: string }): Promise<void> {
    console.log(payload); // debug

    try {

      // 필터링 된 내용을 서버에 저장
      const filteredMessage = filter.clean(payload.chatMessage);
      const chat = await this.chatService.createMessage({ ...payload, chatMessage: filteredMessage });

      // 저장 후, 특정 chatroom에 있는 Client들은 'newMessage' 이벤트 발생 시 해당 내용을 받아가도록 구성
      this.chatServer.to(payload.chatRoomID).emit('newMessage', chat);

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /* 기존 연결이 끊기면 Trigger */
  handleDisconnect(client: Socket) {
    this.numberOfConnectedClients--;
    console.log(`\nChat Websocket Subscribers: ${this.numberOfConnectedClients} ('${client.id}' disconnected)`);
  }
}