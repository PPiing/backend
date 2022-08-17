import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';
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
   * @param receiverSeq 수신자 ID
   * @param alarmCode 알람 코드
   * @param message 알람 상세 메시지
   */
  @OnEvent('alarm:normal')
  async onNormalAlarm(receiverSeq: number, alarmCode: AlarmCode, message: string) {
    this.logger.debug(`onNormalAlarm: ${receiverSeq}: ${alarmCode}`);
    await this.alarmService.addAlarm(0, receiverSeq, AlarmType.ALTP10, alarmCode);
    const clients = await this.alarmService.getOnlineClients(receiverSeq);
    if (clients.length > 0) {
      const obj: ISocketSend = {
        alarmCode,
        message,
      };
      this.server.to(clients).emit('alarm:normal', obj);
    }
  }

  /**
   * 서버에서 생성되는 컨펌 알림 메시지를 클라이언트에 보내고자 할 때 호출되는 콜백함수입니다.
   *
   * @param senderSeq 송신자 ID
   * @param receiverSeq 수신자 ID
   * @param alarmCode 알람 코드
   */
  @OnEvent('alarm:confirm')
  async onConfirmAlarm(senderSeq: number, receiverSeq: number, alarmCode: AlarmCode) {
    this.logger.debug(`onConfirmAlarm: ${receiverSeq}: ${alarmCode}`);
    await this.alarmService.addAlarm(senderSeq, receiverSeq, AlarmType.ALTP20, alarmCode);
    const clients = await this.alarmService.getOnlineClients(receiverSeq);
    if (clients.length > 0) {
      const obj: ISocketSend = {
        senderSeq,
        alarmCode,
      };
      this.server.to(clients).emit('alarm:confirm', obj);
    }
  }

  @OnEvent('alarm:refresh')
  async triggerRefreshAlarm(who: number) {
    this.logger.debug(`emit alarm:confirm to ${who.toString()}`);
    const clients = await this.alarmService.getOnlineClients(who);
    if (clients.length > 0) {
      this.server.to(clients).emit('alarm:confirm');
    }

    // this.server.emit('alarm:normal', who);
    // this.server.emit('alarm:refresh', who);
  }
}
