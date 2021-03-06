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

  /** game list  */
  private games: Map<string, GameData> = new Map();

  /** To quickly get roomId which is participanted by the userSeq */
  private users: Map<number, string> = new Map();

  constructor(
    private eventRunner: EventEmitter2,
    private gameQueue: GameQueue,
    private simulator: SimulationService,
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

    /** after Matching players */
    const [[bluePlayer, blueRule], [redPlayer, redRule]] = [...matchedPlayers];
    const newGame = new GameData();
    /** metaData */
    newGame.metaData = new MetaData(
      randomUUID(),
      bluePlayer,
      redPlayer,
      ruleData.isRankGame,
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
    this.logger.debug('handleDequeue', ruleData);
    return this.gameQueue.deQueue(client, ruleData);
  }

  /**
   * simulatior??? ????????? ???????????? ?????? ?????? ????????????.
   * @param roomId ??? ?????????
   */
  async createGame(roomId: string) {
    this.logger.debug(`createGame(roomId: ${roomId}): creating`);
    const game = this.games.get(roomId);
    this.simulator.initBeforeStartGame(game);
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
    this.simulator.initAfterEndGame(roomId);
  }

  /**
   * ????????? ?????? ????????? ?????????.
   * @param roomId ??? ?????????
   * @param userId ?????? ?????????
   * @param cmd ?????? ????????? ??????
   */
  handlePaddle(roomId: string, userId: number, cmd: PaddleDirective) {
    this.logger.debug(`handlePaddle called with roomId ${roomId} userId ${userId}, ${cmd}`);
    this.simulator.handlePaddle(roomId, userId, cmd);
  }

  /**
   * ????????? ?????? ????????? ?????????.
   * @param roomId ??? ?????????
   * @param userId ?????? ?????????
   * @param cmd ?????? ????????? ??????
   */
  handleTestPaddle(roomId: string, userId: string, cmd: PaddleDirective) {
    this.logger.debug(`handleTestPaddle(roomId: ${roomId}, userId: ${userId})`);
    this.simulator.handleTestPaddle(roomId, userId, cmd);
  }
}
