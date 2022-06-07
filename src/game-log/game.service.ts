import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import GameType from 'src/enums/mastercode/game-type.enum';
import {
  GameData, PatchRule, MetaData, RuleData,
} from './dto/game-data';
import { InGameData, PaddleDirective } from './dto/in-game.dto';
import { SimulationService } from './simulation.service';
import { GameSession } from './interface/game-session';
import { GameQueue } from './game-queue';

type Ready = boolean;

@Injectable()
export class GameService {
  private readonly logger: Logger = new Logger('GameService');

  private games: Map<string, GameData> = new Map();

  private readyCheck: Map<string, Ready> = new Map();

  constructor(
    private eventRunner: EventEmitter2,
    private gameQueue: GameQueue,
    private simulator: SimulationService,
  ) {}

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
      this.games.set(newGame.metaData.roomId, newGame);
      this.readyCheck.set(newGame.metaData.roomId, false);
      ret[0].roomId = newGame.metaData.roomId;
      ret[1].roomId = newGame.metaData.roomId;
      this.eventRunner.emit('game:match', ret);
    }
  }

  handleDequeue(client: GameSession, isLadder: boolean) {
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
      this.eventRunner.emit('game:start', game);
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
    game.inGameData = new InGameData();
    this.readyCheck.delete(roomId);
    this.games.delete(roomId);
    this.simulator.startGame(game);
  }

  async endGame(roomId: string) {
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
