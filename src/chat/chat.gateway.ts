import {
  WebSocketGateway, // Class를 Websocket Gateway로 선언하는데 사용되는 Decorator들
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  /* 웹소켓 서버 인스턴스 생성 */
  @WebSocketServer() chatServer: Server;

  /* 채팅 서비스에 필요한 함수/기능들 Import */
  constructor(private chatService: ChatService) { }

  /* 현재 연결된 유저 수 관리 */
  private numberOfConnectedClients = 0;
  // 웹소켓 전체 연결자 수 외에도 방단위로 추적 가능한데, 방 이름/번호를 먼저 같이 정한 후 처리

  /* 새로운 연결이 생성되면 Trigger */
  handleConnection(client: Socket) {
    this.numberOfConnectedClients++;
    console.log(`Chat Websocket Subscribers: ${this.numberOfConnectedClients} (New connection by '${client.id}')`);

    // 추후 AUTH를 연결하게 되면 연결 요청에 토큰 정보를 보내게 되며, 
    // 그 정보를 여기서 활용해서 인증 / 거부 등을 처리하면 됨
    // 최초 연결 시에만 인증하는게 맞으니 여기서 처리
  }

  /* Client가 특정 Room을 조인하는 경우를 처리 */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, room: string): Promise<void> {
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  /* Client가 Online될 경우 */

  /* 서버가 Client들에 의한 "Message"를 구독 (메시지 발생 시 Trigger) */
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { chatSenderID: string; chatRoomID: string; chatMessage: string }): Promise<void> {
    console.log(payload);

    try {
      // DB에 해당 내용을 저장하고,
      const chat = await this.chatService.createMessage(payload);

      // 특정 chatroom에 있는 Client들은 'newMessage' 이벤트 발생 시 해당 내용을 받아가도록 구성
      this.chatServer.to(payload.chatRoomID).emit('newMessage', chat);

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /* 기존 연결이 끊기면 Trigger */
  handleDisconnect(client: Socket) {
    this.numberOfConnectedClients--;
    console.log(`Chat Websocket Subscribers: ${this.numberOfConnectedClients} ('${client.id}' disconnected)`);

    // 연결이 끊기는 경우, 예컨대 Live 상태를 Offline으로 바꾸는 등 여기서 처리
  }
}