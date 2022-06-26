import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import { SessionMiddleware } from 'src/session-middleware';
import { AlarmService } from './alarm.service';
import ISocketSend from './interface/socket-send';

@WebSocketGateway({ namespace: 'alarm' })
export class AlarmGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AlarmGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private sessionMiddleware: SessionMiddleware,
    private alarmService: AlarmService,
  ) { }

  afterInit(server: any) {
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
    server.use(wrap(this.sessionMiddleware.expressSession));
    server.use(wrap(this.sessionMiddleware.passportInit));
    server.use(wrap(this.sessionMiddleware.passportSession));
  }

  async handleConnection(client: any) {
    const isLogin = client.request.isAuthenticated();
    if (!isLogin) {
      client.disconnect();
      return;
    }
    const { userSeq } = client.request.user;
    this.logger.debug(`handleConnection(userSeq=${userSeq}): ${isLogin ? 'Login' : 'not Login'}`);
    // 현재 접속 세션이 생성된 소켓의 고유 ID와 사용자 식별 ID를 저장합니다.
    await this.alarmService.onlineUserAdd(client, userSeq);
  }

  async handleDisconnect(client: any) {
    // 클라이언트와 채팅 소켓 연결이 끊어지면 정보를 제거합니다.
    const { userSeq } = client.request.user;
    this.logger.debug(`handleDisconnect(userSeq=${userSeq}): Disconnect`);
    await this.alarmService.onlineUserRemove(client, userSeq);
  }

  /**
   * 서버에서 생성되는 알림 메시지를 클라이언트에 보내고자 할 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param message 알림성 메시지
   */
  @OnEvent('alarm:normal')
  async onNormalAlarm(receiverSeq: number, alarmCode: AlarmCode, message: string) {
    this.logger.debug(`onNormalAlarm: ${receiverSeq}: ${alarmCode}`);
    // TODO: 알림 메시지 저장해야 함.
    const clients = await this.alarmService.getOnlineClients(receiverSeq);
    if (clients.length > 0) {
      const obj: ISocketSend = {
        alarmCode,
        message,
      };
      this.server.to(clients).emit('alarm:normal', obj);
    }
  }
}
