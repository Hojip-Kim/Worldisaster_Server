import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewDisastersEntity } from './newDisasters.entity';

@WebSocketGateway({ namespace: 'alerts' })
export class NewDisastersGateway implements OnGatewayConnection, OnGatewayDisconnect {

  /* 웹소켓 서버 인스턴스 생성 */
  @WebSocketServer() server: Server;

  /* 현재 연결된 유저 수 관리 */
  private numberOfConnectedClients = 0;

  /* 새로운 연결이 생성되면 Trigger */
  handleConnection(client: Socket, ...args: any[]) {
    this.numberOfConnectedClients++;
    console.log(`\nAlert Subscribers: ${this.numberOfConnectedClients} (New connection by '${client.id}')`);
  }

  /* 고객들에게 알림을 보내는 역할 */
  sendDisasterWebsocketAlert(disaster: NewDisastersEntity) {
    const disasterString = JSON.stringify(disaster);
    this.server.emit('disaster-alert', disasterString);
  }

  /* 연결이 끊기면 Trigger */
  handleDisconnect(client: Socket) {
    this.numberOfConnectedClients--;
    console.log(`\nAlert Subscribers: ${this.numberOfConnectedClients}('${client.id}' disconnected)`);
  }
}