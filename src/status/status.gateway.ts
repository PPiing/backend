import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import UserStatus from 'src/enums/mastercode/user-status.enum';
import { SessionMiddleware } from 'src/session-middleware';
import { StatusService } from './status.service';

@WebSocketGateway({
  namespace: 'status',
})

export class StatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(StatusGateway.name);

  constructor(
    private sessionMiddleware: SessionMiddleware,
    private readonly statusService: StatusService,
  ) { }

  /**
   * 소켓에도 세션을 적용하기 위한 미들웨어 적용
   *
   * @param server 소켓 서버측 객체
   */
  afterInit(server: any) {
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
    server.use(wrap(this.sessionMiddleware.expressSession));
    server.use(wrap(this.sessionMiddleware.passportInit));
    server.use(wrap(this.sessionMiddleware.passportSession));
  }

  @WebSocketServer()
    server: Server;

  /**
   * 처음 socket이 연결되었을 때
   * NOTE : 연결 시 유저의 정보를 전달해주어야함 (userSeq)
   *
   * @param client 연결된 client socket
   */
  async handleConnection(client: any) {
    this.logger.debug(`Client connected: ${client.id}`);

    const isLogin = client.request.isAuthenticated();
    if (!isLogin) {
      client.disconnect();
      return;
    }

    const { userSeq } = client.request.user;
    await this.statusService.onlineUserAdd(client, userSeq);

    // NOTE: 마소터코드로 보낼 것인가?
    const friendsList: string[] = await this.statusService.getFriends(userSeq);
    client.to(friendsList).emit('status_update', {
      userSeq,
      status: UserStatus.USST10,
    });

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    await this.statusService.saveClient(client, userSeq);
  }

  /**
   * 접속을 종료하였을 때
   *
   * @param client 연결을 종료한 client socket
   */
  async handleDisconnect(client: any) {
    this.logger.debug(`Client disconnected: ${client.id}`);

    const { userSeq } = client.request.user;
    await this.statusService.onlineUserRemove(client, userSeq);
  }

  /**
   * 로그아웃
   *
   * @param client 연결된 client socket
   */
  @OnEvent('event:logout')
  async onLogout(userSeq: number) {
    this.logger.debug(`Client logout: ${userSeq}`);

    const friendsList: string[] = await this.statusService.getFriends(userSeq);
    this.server.to(friendsList).emit('status_update', {
      userSeq,
      status: UserStatus.USST20,
    });

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    await this.statusService.logoutUser(userSeq);
  }

  /**
   * 게임을 시작했을 때
   * eventEmitter로 게임 시작에 대한 api를 받을 때 사용
   *
   * @param client 연결된 client socket
   */
  @OnEvent('event:gameStart')
  async onGameStart(userSeq: number) {
    this.logger.debug(`Client start game: ${userSeq}`);

    const friendsList: string[] = await this.statusService.getFriends(userSeq);
    this.server.to(friendsList).emit('status_update', {
      userSeq,
      status: UserStatus.USST30,
    });

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    await this.statusService.updateStatus(userSeq, UserStatus.USST30);
  }

  /**
   * 게임이 끝났을 때
   * eventEmitter로 게임 시작에 대한 api를 받을 때 사용
   *
   * @param client 연결된 client socket
   */
  @OnEvent('event:gameEnd')
  async onGameFinish(userSeq: number) {
    this.logger.debug(`Client finish game: ${userSeq}`);

    const friendsList: string[] = await this.statusService.getFriends(userSeq);
    this.server.to(friendsList).emit('status_update', {
      userSeq,
      status: UserStatus.USST10,
    });
    // 서버에 저장되어 있는 자신의 상태를 업데이트
    await this.statusService.updateStatus(userSeq, UserStatus.USST10);
  }
}
