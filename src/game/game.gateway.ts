import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  SubscribeMessage, WebSocketGateway,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketGuard } from 'src/guards/socket.guard';
import { SessionMiddleware } from 'src/session-middleware';
import {
  PaddleDirective, RenderData, GameData,
} from './dto/game-data';
import { GameSocket } from './dto/game-socket.dto';
import { ScoreData } from './dto/in-game.dto';
import { RuleDto } from './dto/rule.dto';
import { GameSocketSession } from './game-socket-session';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '',
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('GameGateway');

  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly socketSession: GameSocketSession,
    private readonly gameService: GameService,
    private readonly sessionMiddleware: SessionMiddleware,
  ) { }

  /**
   * Apply passport authentication.
   * socketSession will be deprecated.
   */
  afterInit(server: any) {
    this.logger.debug('Initialize');
    server.use((socket, next) => {
      this.socketSession.joinSession(socket, next);
    });
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
    server.use(wrap(this.sessionMiddleware.expressSession));
    server.use(wrap(this.sessionMiddleware.passportInit));
    server.use(wrap(this.sessionMiddleware.passportSession));
  }

  /**
   * 첫 접속시에 session에 저장되어 있던
   * userId와 RoomId(game)에 접속을 시켜준다.
   * @param client 서버에 접속하는 클라이언트
   */
  handleConnection(client: GameSocket) {
    this.logger.debug(`user ${client.session.userId} connected`);
    client.join(client.session.userId.toString());
    if (client.session.roomId) { // 게임중에 나갔을 경우 재접.
      client.join(client.session.roomId);
      this.server.to(client.session.roomId).emit('player:join', client.session.userId);
    }
  }

  /**
   * 유저아이디로 된 방에서 나갈경우에,
   * 게임중(세팅 + 플레이)이면 플레이어가 나갔다고 알린다.
   * @param client 클라이언트 접속을 끊었을 때
   */
  async handleDisconnect(client: any) {
    this.logger.debug(`user ${client.session.userId} disconnected`);
    const matchingSocket = await this.server.in(client.session.userId.toString()).allSockets();
    const isDisconnected = matchingSocket.size === 0;
    if (isDisconnected) {
      if (client.session.roomId !== null) {
        client.to(client.session.roomId).emit('player:leave', client.session.userId);
      }
    }
  }

  /** TODO(jinbekim): rename subscribeMessage
   */
  @UseGuards(SocketGuard)
  @SubscribeMessage('enQ')
  async handleEnqueue(client: GameSocket, ruleData: RuleDto) {
    this.logger.debug(`user ${client.session.userId} enqueued`);
    return this.gameService.handleEnqueue(client.session, ruleData);
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('deQ')
  handleDequeue(client: GameSocket, ruleData: RuleDto) {
    this.logger.debug(`user ${client.session.userId} request dequeued`);
    return this.gameService.handleDequeue(client.session, ruleData);
  }

  @OnEvent('game:ready')
  handleMatch(gameData: GameData) {
    this.logger.debug('game:ready');
    const { ruleData, metaData, metaData: { playerBlue, playerRed } } = gameData;
    const players = [
      playerBlue?.userId?.toString(),
      playerRed?.userId?.toString(),
    ];
    /** emit match data */
    this.server.to(players).emit('game:ready', {
      ruleData,
      blueUser: metaData?.playerBlue?.userName,
      redUser: metaData?.playerRed?.userName,
    });
    /** join in gameRoom */
    this.server.in(players).socketsJoin(playerBlue?.roomId);

    /** save players session data
     * GameSession이 아니라 GameSocket이나 Socket을 저장하는건 어떨까?
    */
    const blueSession = { ...playerBlue, roomId: metaData.roomId };
    const redSession = { ...playerRed, roomId: metaData.roomId };
    this.socketSession.saveSession(playerBlue.sessionId, blueSession);
    this.socketSession.saveSession(playerRed.sessionId, redSession);
  }

  /**
   * 게임 시작전 ready 이벤트
   * @param roomId 방 아이디
   */
  @OnEvent('game:start')
  handleGamestart(roomId: string) {
    this.logger.debug(`game:start, ${roomId}`);
    this.server.to(roomId).emit('game:start');
  }

  // /**
  //  * 자신의 패들의 움직임 방향을 바꾼다.
  //  * @param client 유저 소켓
  //  * @param data paddle의 움직임 방향
  //  */
  // @UseGuards(SocketGuard)
  // @SubscribeMessage('game:paddle')
  // handlePaddleControl(client: GameSocket, data: { direction: PaddleDirective }) {
  //   this.logger.debug(`user ${client.session.userId} moved paddle ${data}`);
  //   this.gameService.handlePaddle(client.session.roomId, client.session.userId, data.direction);
  // }

  /**
   * 자신의 패들의 움직임 방향을 바꾼다.
   * @param client 유저 소켓
   * @param data paddle의 움직임 방향
   */
  @UseGuards(SocketGuard)
  @SubscribeMessage('game:paddle')
  handlePaddleTestControl(client: GameSocket, data: { direction: PaddleDirective }) {
    this.logger.debug(`user ${client.session.userId} moved paddle ${data}`);
    this.gameService.handleTestPaddle(client.id, client.id, data.direction);
  }

  @SubscribeMessage('test:render')
  forTestPurpose(client: GameSocket) {
    this.logger.debug(`test:render ${client}`);
    this.gameService.createTestGame(client);
  }

  /**
   * 해당 방이 존재하는지 체크후에 소켓룸에 조인한다.
   * @param client 관전하고 싶어하는 사람
   * @param data 방아이디
   */
  @SubscribeMessage('game:watch')
  watchGameByRoomId(client: GameSocket, data: { roomId: string }) {
    this.logger.debug(`game:watch ${client.session.userId} to ${data.roomId}`);
    const presence = this.gameService.checkPresenceOf(data.roomId);
    if (presence === true) {
      this.server.in(client.session.userId.toString()).socketsJoin(data.roomId);
      client.in(data.roomId).emit('watcher:enter', client.session.userId.toString());
      this.logger.debug(`userId: ${client.session.userId} join in ${data.roomId}`);
    } else {
      this.server.in(client.session.userId.toString()).emit('failure');
      this.logger.debug(`userId: ${client.session.userId} failt to join in ${data.roomId}`);
    }
  }

  /**
   * 해당 방이 존재하는지를 체크하고 소켓룸에서 나온다.
   * @param client 관전에서 나가고 싶어하는 사람
   * @param data 방아이디
   */
  @SubscribeMessage('game:unwatch')
  unwatchGameByRoomId(client: GameSocket, data: { roomId: string }) {
    this.logger.debug(`game:unwatch ${client.session.userId} from ${data.roomId}`);
    const presence = this.gameService.checkPresenceOf(data.roomId);
    if (presence) {
      this.server.in(client.session.userId.toString()).socketsLeave(data.roomId);
      client.in(data.roomId).emit('watcher:leave', client.session.userId.toString());
      this.logger.debug(`userId: ${client.session.userId} left from ${data.roomId}`);
    } else {
      this.server.in(client.session.userId.toString()).emit('failure');
      this.logger.debug(`userId: ${client.session.userId} failt to leave from ${data.roomId}`);
    }
  }

  /**
   * 데이터를 랜더한다.
   * @param roomId 게임의 roomId
   * @param renderData RenderData
   */
  @OnEvent('game:render')
  handleGameData(roomId: string, renderData: RenderData) {
    // this.logger.debug(`game ${roomId} was rendered renderData: ${renderData}`);
    this.server.to(roomId).emit('game:render', renderData);
  }

  /**
   * 득점시에 보내는 데이터.
   * @param roomId 게임의 roomId
   * @param scoreData ScoreData
   */
  @OnEvent('game:score')
  handleGameScore(roomId: string, scoreData: ScoreData) {
    this.logger.debug(`game ${roomId} was scored scoreData: ${scoreData}`);
    this.server.to(roomId).emit('game:score', scoreData);
  }

  /**
   * 게임이 종료되었음을 클라이언트에 알린다.
   * @param roomId 게임의 roomId
   */
  @OnEvent('game:end')
  handleGameEnd(gameData: GameData) {
    const { metaData, metaData: { roomId } } = gameData;
    this.logger.debug(`game ${roomId} ended with data: ${gameData}`);
    this.gameService.endGame(roomId);
    this.socketSession.saveSession(metaData.playerBlue.sessionId, {
      ...metaData.playerBlue,
      roomId: null,
    });
    this.socketSession.saveSession(metaData.playerRed.sessionId, {
      ...metaData.playerRed,
      roomId: null,
    });
    this.server.to(roomId).emit('game:end', gameData);
    this.server.in(roomId).socketsLeave(roomId);
  }
}
