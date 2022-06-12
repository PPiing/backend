import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import UserStatus from 'src/enums/mastercode/user-status.enum';
import { StatusService } from './status.service';

@WebSocketGateway({ namespace: 'status' })
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(StatusGateway.name);

  constructor(
    private readonly statusService: StatusService,
  ) { }

  @WebSocketServer()
    server: Server;

  /**
   * 처음 socket이 연결되었을 때
   * NOTE : 연결 시 유저의 정보를 전달해주어야함 (userSeq)
   *
   * @param client 연결된 client socket
   */
  async handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);

    // 서버에 client의 정보와 현재 상태를 master code 기반으로 저장
    const userSeq = Number(client.handshake.query.userSeq);
    if (userSeq === undefined) { // 유저정보가 없을 경우
      this.logger.error(`Client connected: ${client.id}`);
    }

    // client.emit("users", 현재 저장된 자신의 socket 정보 전달);

    // TODO: 자신의 친구들에게만
    // client.broadcast.emit("user connected", 현재 저장된 자신의 socket 정보 전달);

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    this.statusService.saveClient(client, userSeq);

    this.statusService.updateStatus(client, UserStatus.USST10);
  }

  /**
   * 접속을 종료하였을 때
   *
   * @param client 연결을 종료한 client socket
   */
  async handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);

    // client.emit("users", 현재 저장된 자신의 socket 정보 전달);

    // TODO: 자신의 친구들에게만
    // client.broadcast.emit("user connected", 현재 저장된 자신의 socket 정보 전달);

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    this.statusService.removeClient(client);

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    this.statusService.updateStatus(client, UserStatus.USST10);
  }

  /**
   * 게임을 시작했을 때
   * eventEmitter로 게임 시작에 대한 api를 받을 때 사용
   *
   * @param client 연결된 client socket
   */
  @OnEvent('game:start')
  async onGameStart(client: Socket) {
    this.logger.debug(`Client start game: ${client.id}`);

    // client.emit("users", 현재 저장된 자신의 socket 정보 전달);

    // TODO: 자신의 친구들에게만
    // client.broadcast.emit("user connected", 현재 저장된 자신의 socket 정보 전달);

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    this.statusService.updateStatus(client, UserStatus.USST30);
  }

  /**
   * 게임이 끝났을 때
   * eventEmitter로 게임 시작에 대한 api를 받을 때 사용
   *
   * @param client 연결된 client socket
   */
  @OnEvent('game:finish')
  async onGameFinish(client: Socket) {
    this.logger.debug(`Client finish game: ${client.id}`);

    // client.emit("users", 현재 저장된 자신의 socket 정보 전달);

    // TODO: 자신의 친구들에게만
    // client.broadcast.emit("user connected", 현재 저장된 자신의 socket 정보 전달);

    // 서버에 저장되어 있는 자신의 상태를 업데이트
    this.statusService.updateStatus(client, UserStatus.USST10);
  }
}
