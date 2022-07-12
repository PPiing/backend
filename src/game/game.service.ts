import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import GameType from 'src/enums/mastercode/game-type.enum';
import GameOption from 'src/enums/mastercode/game-option.enum';
import {
  GameData, PatchRule, MetaData, RuleData,
} from './dto/game-data';
import { InGameData, PaddleDirective } from './dto/in-game.dto';
import { SimulationService } from './simulation.service';
import { GameQueue } from './game-queue';
import { GameSession } from './dto/game-session.dto';

type Ready = boolean;

@Injectable()
export class GameService {
  private readonly logger: Logger = new Logger('GameService');

  private games: Map<string, GameData> = new Map();

  /**
   * To quickly get roomId which is participanted by the userSeq
   */
  private users: Map<number, string> = new Map();

  private readyCheck: Map<string, Ready> = new Map();

  constructor(
    private eventRunner: EventEmitter2,
    private gameQueue: GameQueue,
    private simulator: SimulationService,
  ) {}

  findCurrentGame(userSeq: number): GameData | undefined {
    const roomId = this.users.get(userSeq);
    return this.games.get(roomId);
  }

  async handleEnqueue(client: GameSession, isLadder: GameType) {
    const ret = await this.gameQueue.enQueue(client, isLadder);
    if (typeof ret === 'object') {
      const newGame = new GameData();
      newGame.metaData = new MetaData(
        randomUUID(),
        ret[0],
        ret[1],
        isLadder,
      );
      newGame.ruleData = new RuleData();
      newGame.inGameData = new InGameData();
      this.games.set(newGame.metaData.roomId, newGame);
      this.users.set(ret[0].userId, ret[0].roomId);
      this.users.set(ret[1].userId, ret[1].roomId);
      this.readyCheck.set(newGame.metaData.roomId, false);
      ret[0].roomId = newGame.metaData.roomId;
      ret[1].roomId = newGame.metaData.roomId;
      this.eventRunner.emit('game:match', ret);
    }
  }

  handleDequeue(client: GameSession, isLadder: GameType) {
    return this.gameQueue.deQueue(client, isLadder);
  }

  /**
   * 변경된 부분의 데이터를 변경한다.
   * 이 과정에서 랜덤적인 요소가 들어 갈듯.
   * @param roomId 방 아이디
   * @param ruleData 게임 설정 데이터
   */
  handleRule(roomId: string, ruleData: PatchRule) {
    const rule = this.games.get(roomId)?.ruleData;
    if (rule) {
      Object.assign(rule, ruleData);
    }
  }

  /**
   * 상대방이 ready한 상태에서 ready를 할 경우 게임 시작한다.
   * @param roomId 방 아이디
   * @param isReady ready 상태
   */
  handleReady(roomId: string, isReady: boolean) {
    const ready = this.readyCheck.get(roomId);
    if (ready && isReady) {
      const game = this.games.get(roomId);
      this.eventRunner.emit('game:ready', game);
    } else {
      this.readyCheck.set(roomId, isReady);
    }
  }

  /**
   * simulatior에 게임을 등록하고 임시 방은 삭제한다.
   * @param roomId 방 아이디
   */
  async createGame(roomId: string) {
    const game = this.games.get(roomId);
    const { ruleData: { option1, option2, option3 } } = game;

    const inGameDataForm = new InGameData();

    /** default options */
    inGameDataForm.ballSpeed = 1;
    inGameDataForm.matchScore = 5;
    inGameDataForm.paddleSize = 1;

    /** GLOP20 slow, GLOP22 fast */
    if (option1 === GameOption.GLOP20) inGameDataForm.paddleSize = 0.5;
    if (option1 === GameOption.GLOP22) inGameDataForm.paddleSize = 1.5;

    /** GLOP30 slow, GLOP32 fast */
    if (option2 === GameOption.GLOP30) inGameDataForm.ballSpeed = 0.8;
    if (option2 === GameOption.GLOP32) inGameDataForm.ballSpeed = 1.2;

    /** GLOP40 3, GLOP42 7 */
    if (option3 === GameOption.GLOP40) inGameDataForm.matchScore = 3;
    if (option3 === GameOption.GLOP42) inGameDataForm.matchScore = 7;

    game.inGameData = inGameDataForm;
    this.readyCheck.delete(roomId);
    this.simulator.startGame(game);
  }

  async endGame(roomId: string) {
    const { playerTop, playerBtm } = this.games.get(roomId).metaData;
    this.games.delete(roomId);
    this.users.delete(playerBtm.userId);
    this.users.delete(playerTop.userId);
    this.simulator.endGame(roomId);
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
}
