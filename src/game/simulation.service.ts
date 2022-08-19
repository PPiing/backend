import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GameData } from './dto/game-data';
import { GameStatus, PaddleDirective } from './dto/in-game.dto';
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

  findCurrentGame() {
    const ret: GameData[] = [];
    this.games.forEach((value, key, map) => {
      ret.push(value);
    });
    console.log('🚀 ~ file: simulation.service.ts ~ line 27 ~ SimulationService ~ findCurrentGame ~ ret', ret);
    return ret;
  }

  addInterval(roomId: string, gameData:GameData, milliseconds: number) {
    const callback = () => {
      const { inGameData, metaData } = gameData;
      inGameData.frame += 1;
      if (inGameData.frame > 10000) inGameData.status = GameStatus.End;
      switch (inGameData.status) {
        case GameStatus.Ready: {
          const isReady: boolean = readyToStart(gameData);

          if (isReady === false) inGameData.status = GameStatus.Ready;
          if (isReady === true) inGameData.status = GameStatus.Playing;
          if (inGameData.status === GameStatus.Playing) {
            this.eventRunner.emit('game:start', roomId);
            this.eventRunner.emit('event:gameStart', metaData.playerBlue.userSeq);
            this.eventRunner.emit('event:gameStart', metaData.playerRed.userSeq);
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
            inGameData.winnerSeq = metaData.playerRed.userSeq;
          }
          if (gameResult === GameResult.blueWin) {
            inGameData.status = GameStatus.End;
            inGameData.winnerSeq = metaData.playerBlue.userSeq;
          }
          break;
        }
        case GameStatus.End: {
          this.eventRunner.emit('game:end', { metaData, inGameData });
          this.eventRunner.emit('event:gameEnd', metaData.playerBlue.userSeq);
          this.eventRunner.emit('event:gameEnd', metaData.playerRed.userSeq);
          inGameData.status = GameStatus.Ending;
          break;
        }
        case GameStatus.Ending: {
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
    const { metaData } = game;
    const logSeq = await this.gameLogService.saveInitGame(game);
    if (logSeq) {
      metaData.gameLogSeq = logSeq;
      this.logger.debug('success to save game b4 start');
    } else {
      this.logger.debug('failure to save game b4 start');
    }

    /* add game in simulation game queue */
    this.games.set(metaData.roomId, game);
    this.addInterval(metaData.roomId, game, 17);
  }

  /**
  * 게임 종료 후에 메모리상에 있는 게임을 레파지토리로 저장한다.
  * @param roomId 방 아이디
  */
  async saveAfterEndGame(roomId: string) {
    this.logger.debug('saveAfterEndGame', roomId);
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
    this.logger.debug(`handle paddle roomId: ${roomId}`);
    const game = this.games.get(roomId);
    if (!game) {
      this.logger.debug(`${userId} try to handle paddle without roomId`);
      return;
    }
    const { metaData, inGameData } = game;
    if (!metaData || !inGameData) {
      this.logger.debug('game has no meta and ingame');
      return;
    }
    if (metaData.playerBlue.userSeq === userId) {
      inGameData.paddleBlue.velocity.y = direction;
    }
    if (metaData.playerRed.userSeq === userId) {
      inGameData.paddleRed.velocity.y = direction;
    }
  }
}
