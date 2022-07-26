import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GameData, MetaData } from './dto/game-data';
import { GameStatus, InGameData, PaddleDirective } from './dto/in-game.dto';
import { GameSocket } from './dto/game-socket.dto';
import { RuleDto } from './dto/rule.dto';
import { RoundResult } from './checkStatus/check.end-of-round';
import { GameResult } from './checkStatus/check.end-of-game';
import { GameLogService } from './game-log.service';
import readyToStart from './gameStatus/ready';
import handlePlaying from './gameStatus/playing';
import handleScore from './gameStatus/score';

@Injectable()
export class SimulationService {
  private readonly logger: Logger = new Logger('SimulationService');

  private games: Map<string, GameData> = new Map();

  constructor(
    private readonly eventRunner: EventEmitter2,
    private readonly gameLogService: GameLogService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  addInterval(roomId: string, gameData:GameData, milliseconds: number) {
    const callback = () => {
      const { inGameData, metaData } = gameData;
      inGameData.frame += 1;
      switch (inGameData.status) {
        case GameStatus.Ready: {
          const isReady: boolean = readyToStart(gameData);

          if (isReady === false) inGameData.status = GameStatus.Ready;
          if (isReady === true) inGameData.status = GameStatus.Playing;
          if (inGameData.status === GameStatus.Playing) {
            this.eventRunner.emit('game:start', roomId);
          }
          break;
        }
        case GameStatus.Playing: {
          const roundResult: RoundResult = handlePlaying(gameData);
          this.eventRunner.emit('game:render', roomId, inGameData.renderData);

          if (roundResult === RoundResult.playing) inGameData.status = GameStatus.Playing;
          if (roundResult === RoundResult.blueWin) inGameData.status = GameStatus.ScoreBlue;
          if (roundResult === RoundResult.redWin) inGameData.status = GameStatus.ScoreRed;
          break;
        }
        case GameStatus.ScoreBlue:
        case GameStatus.ScoreRed:
        {
          const gameResult = handleScore(gameData);
          this.eventRunner.emit('game:score', roomId, inGameData.scoreData);

          if (gameResult === GameResult.playing) inGameData.status = GameStatus.Playing;
          if (gameResult === GameResult.redWin) {
            inGameData.status = GameStatus.End;
            inGameData.winnerSeq = metaData.playerRed.userId;
          }
          if (gameResult === GameResult.blueWin) {
            inGameData.status = GameStatus.End;
            inGameData.winnerSeq = metaData.playerBlue.userId;
          }
          break;
        }
        case GameStatus.End: {
          this.eventRunner.emit('game:end', { metaData, inGameData });
          break;
        }
        default: {
          this.logger.error(`unknown status: ${inGameData.status}`);
          // TODO: handling error
          break;
        }
      }
    };
    const interval = setInterval(callback, milliseconds);
    this.schedulerRegistry.addInterval(roomId, interval);
  }

  /**
   * 시뮬레이션 큐에 해당 게임을 등록한다.
   * @param game 등록할 게임 데이터
   */
  async initBeforeStartGame(game: GameData) {
    this.logger.debug(`startGame: ${game.metaData}`);
    /* add game in simulation game queue */
    this.games.set(game.metaData.roomId, game);
    this.addInterval(game.metaData.roomId, game, 17);

    const { metaData } = game;
    const logSeq = await this.gameLogService.saveInitGame(game);
    if (logSeq) {
      metaData.gameLogSeq = logSeq;
      this.logger.debug('success to save game b4 start');
    } else {
      this.logger.debug('failure to save game b4 start');
    }
  }

  /** NOTE: will be deleted */
  initBeforeStartTestGame(client: GameSocket) {
    this.logger.debug('TEST!!! TEST!!! startGame:');
    /* add game in simulation game queue */
    const tmp = new GameData();
    tmp.inGameData = new InGameData();
    tmp.ruleData = new RuleDto();
    tmp.metaData = new MetaData(client.id, client.session, null, tmp.ruleData.isRankGame);

    this.games.set(client.id, tmp);
    this.eventRunner.emit('game:ready', tmp);
  }

  /**
  * 게임 종료 후에 메모리상에 있는 게임을 레파지토리로 저장한다.
  * @param roomId 방 아이디
  */
  async saveAfterEndGame(roomId: string) {
    this.logger.debug('saveAfterEndGame', roomId);
    /** gamedata map을 유지할 필요가 있나? */
    this.schedulerRegistry.deleteInterval(roomId);
    const gameData = this.games.get(roomId);
    const result = await this.gameLogService.saveFinishedGame(gameData);
    if (result) this.games.delete(roomId);
  }

  /**
  * 해당 유저의 패들의 방향을 변경한다.
  * @param roomId 방 아이디
  * @param userId 방향을 바꿀 유저 아이디
  * @param direction 패들의 방향
  */
  handlePaddle(
    roomId: string,
    userId: number,
    direction: PaddleDirective,
  ) {
    const { metaData, inGameData } = this.games.get(roomId);
    if (!metaData || !inGameData) return;
    if (metaData.playerBlue.userId === userId) {
      inGameData.paddleBlue.velocity.y = direction;
    }
    if (metaData.playerRed.userId === userId) {
      inGameData.paddleRed.velocity.y = direction;
    }
  }

  /** NOTE: will be deleted */
  handleTestPaddle(
    roomId: string,
    userId: string,
    direction: PaddleDirective,
  ) {
    this.logger.debug('TEST!!!! TEST!! moved paddle');
    const { metaData, inGameData } = this.games.get(roomId);
    if (!metaData || !inGameData) return;
    if (metaData.playerBlue.userId.toString() === userId) {
      inGameData.paddleBlue.velocity.x = direction;
    }
    if (metaData.playerRed.userId.toString() === userId) {
      inGameData.paddleRed.velocity.x = direction;
    }
  }
}
