import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { AlarmService } from 'src/alarm/alarm.service';
import {
  GameData, MetaData,
} from './dto/game-data';
import { InGameData, PaddleDirective } from './dto/in-game.dto';
import { SimulationService } from './simulation.service';
import { GameQueue } from './game-queue';
import { GameSession } from './dto/game-session.dto';
import { RuleDto } from './dto/rule.dto';
import { GameSocket } from './dto/game-socket.dto';

@Injectable()
export class GameService {
  private readonly logger: Logger = new Logger('GameService');

  /** game list  */
  private games: Map<string, GameData> = new Map();

  /** To quickly get roomId which is participanted by the userSeq */
  private users: Map<number, string> = new Map();

  constructor(
    private eventRunner: EventEmitter2,
    private gameQueue: GameQueue,
    private simulator: SimulationService,
    private readonly userService: UserService,
    private readonly alarmService: AlarmService,
  ) {}

  checkPresenceOf(roomId: string): boolean {
    if (this.games.get(roomId)) return true;
    return false;
  }

  findCurrentGame(userSeq: number): GameData | undefined {
    const roomId = this.users.get(userSeq);
    return this.games.get(roomId);
  }

  async handleEnqueue(client: GameSession, ruleData: RuleDto) {
    this.logger.debug(`user client: ${client.userId} and ruleData: ${ruleData}`);
    const matchedPlayers = await this.gameQueue.enQueue(client, ruleData);

    /** if not matched return */
    if (matchedPlayers === false) return;
    this.createGame(matchedPlayers);
  }

  handleDequeue(client: GameSession, ruleData: RuleDto) {
    this.logger.debug('handleDequeue', ruleData);
    return this.gameQueue.deQueue(client, ruleData);
  }

  /**
   * 게임 초대 수락시에 일단 룰을 설정하는 기능은 없음.
   */
  async handleAcceptInvite(alarmSeq: number) {
    this.logger.debug('handle Invite');
    const alarm = await this.alarmService.getAlarmBySeq(alarmSeq);
    const user1 = await this.userService.findByUserId(alarm.receiverSeq);
    const user2 = await this.userService.findByUserId(alarm.senderSeq);
    if (user1 === undefined || user2 === undefined) { throw new NotFoundException('해당 유저가 존재하지 않습니다.'); }
    const rule = new RuleDto();
    const roomId = randomUUID();
    const bluePlayer: GameSession = { ...user1, roomId };
    const redPlayer: GameSession = { ...user2, roomId };
    this.createGame([[bluePlayer, rule], [redPlayer, rule]]);
  }

  /**
   * @param roomId 방 아이디
   */
  async createGame(matchedPlayers: [GameSession, RuleDto][]) {
    this.logger.debug('createGame(matchedPlayers): creating');

    /** after Matching players */
    const [[bluePlayer, blueRule], [redPlayer, redRule]] = [...matchedPlayers];
    const newGame = new GameData();
    /** metaData */
    newGame.metaData = new MetaData(
      randomUUID(),
      bluePlayer,
      redPlayer,
      blueRule.isRankGame,
    );
    /** temporarily apply bluePlayer's rule */
    newGame.ruleData.ballSpeed = blueRule.ballSpeed;
    newGame.ruleData.matchScore = blueRule.ballSpeed;
    newGame.ruleData.paddleSize = redRule.ballSpeed;

    /** inGameData */
    newGame.inGameData = new InGameData();
    this.games.set(newGame.metaData.roomId, newGame);
    this.users.set(bluePlayer.userId, bluePlayer.roomId);
    this.users.set(redPlayer.userId, redPlayer.roomId);
    bluePlayer.roomId = newGame.metaData.roomId;
    redPlayer.roomId = newGame.metaData.roomId;

    /** add gameData into simulator */
    this.simulator.initBeforeStartGame(newGame);
    this.eventRunner.emit('game:ready', newGame.metaData);
  }

  createTestGame(client: GameSocket) {
    this.logger.debug('createTestGame', client);
    this.simulator.initBeforeStartTestGame(client);
  }

  async endGame(roomId: string) {
    this.logger.debug(`ended games roomId: ${roomId}`);
    const { playerBlue, playerRed } = this.games.get(roomId).metaData;
    this.games.delete(roomId);
    this.users.delete(playerRed.userId);
    this.users.delete(playerBlue.userId);
    this.simulator.saveAfterEndGame(roomId);
  }

  /**
   * 자신의 패들 방향을 바꾼다.
   * @param roomId 방 아이디
   * @param userId 유저 아이디
   * @param cmd 패들 움직임 명령
   */
  handlePaddle(roomId: string, userId: number, cmd: PaddleDirective) {
    this.logger.debug(`handlePaddle called with roomId ${roomId} userId ${userId}, ${cmd}`);
    this.simulator.handlePaddle(roomId, userId, cmd);
  }

  /**
   * 자신의 패들 방향을 바꾼다.
   * @param roomId 방 아이디
   * @param userId 유저 아이디
   * @param cmd 패들 움직임 명령
   */
  handleTestPaddle(roomId: string, userId: string, cmd: PaddleDirective) {
    this.logger.debug(`handleTestPaddle(roomId: ${roomId}, userId: ${userId})`);
    this.simulator.handleTestPaddle(roomId, userId, cmd);
  }
}
