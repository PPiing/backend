import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
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

  private games: Map<string, GameData> = new Map();

  /**
   * To quickly get roomId which is participanted by the userSeq
   */
  private users: Map<number, string> = new Map();

  constructor(
    private eventRunner: EventEmitter2,
    private gameQueue: GameQueue,
    private simulator: SimulationService,
  ) {}

  findCurrentGame(userSeq: number): GameData | undefined {
    const roomId = this.users.get(userSeq);
    return this.games.get(roomId);
  }

  async handleEnqueue(client: GameSession, ruldData: RuleDto) {
    const matchedPlayers = await this.gameQueue.enQueue(client, ruldData);

    /** if not matched return */
    if (matchedPlayers === false) return;

    /** after Matching players */
    const [[bluePlayer, blueRule], [redPlayer, redRule]] = [...matchedPlayers];
    const newGame = new GameData();
    /** metaData */
    newGame.metaData = new MetaData(
      randomUUID(),
      bluePlayer,
      redPlayer,
      ruldData.isRankGame,
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

    this.eventRunner.emit('game:ready', newGame.metaData);
  }

  handleDequeue(client: GameSession, ruleData: RuleDto) {
    return this.gameQueue.deQueue(client, ruleData);
  }

  /**
   * simulatior에 게임을 등록하고 임시 방은 삭제한다.
   * @param roomId 방 아이디
   */
  async createGame(roomId: string) {
    const game = this.games.get(roomId);
    this.simulator.initBeforeStartGame(game);
  }

  createTestGame(client: GameSocket) {
    this.simulator.initBeforeStartTestGame(client);
  }

  async endGame(roomId: string) {
    const { playerBlue, playerRed } = this.games.get(roomId).metaData;
    this.games.delete(roomId);
    this.users.delete(playerRed.userId);
    this.users.delete(playerBlue.userId);
    this.simulator.initAfterEndGame(roomId);
  }

  /**
   * 자신의 패들 방향을 바꾼다.
   * @param roomId 방 아이디
   * @param userId 유저 아이디
   * @param cmd 패들 움직임 명령
   */
  handlePaddle(roomId: string, userId: number, cmd: PaddleDirective) {
    this.simulator.handlePaddle(roomId, userId, cmd);
  }

  /**
   * 자신의 패들 방향을 바꾼다.
   * @param roomId 방 아이디
   * @param userId 유저 아이디
   * @param cmd 패들 움직임 명령
   */
  handleTestPaddle(roomId: string, userId: string, cmd: PaddleDirective) {
    this.simulator.handleTestPaddle(roomId, userId, cmd);
  }
}
