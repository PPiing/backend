import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { GameData, MetaData } from './dto/game-data';
import { GameStatus, InGameData, PaddleDirective } from './dto/in-game.dto';
import { calculateBallDisplacement } from './calPosition/calculate.ball.displacement';
import { GameSocket } from './dto/game-socket.dto';
import { RuleDto } from './dto/rule.dto';
import { calculatePaddleDisplacement } from './calPosition/calculate.paddle.displacement';
import { checkWallBound } from './checkBound/check.wall.bound';
import { checkPaddleBound } from './checkBound/check.paddle.bound';
import { checkEndOfRound, RoundResult } from './checkStatus/check.end-of-round';
import { checkEndOfGame, GameResult } from './checkStatus/check.end-of-game';
import { GameLogService } from './game-log.service';

@Injectable()
export class SimulationService {
  private readonly logger: Logger = new Logger('SimulationService');

  private games: Map<string, GameData> = new Map();

  constructor(
    private readonly eventRunner: EventEmitter2,
    private readonly gameLogService: GameLogService,
  ) {}

  @Interval(17) // TODO: games가 변경되면 이벤트를 발생시킨다.로 수정. 아니면 다이나믹 모듈로 변경해도 될듯.
  handleGames() {
    this.games.forEach((gameData, roomId) => {
      const { inGameData, metaData } = gameData;
      inGameData.frame += 1;
      switch (inGameData.status) {
        case GameStatus.Ready: {
          const isDelayedEnough: boolean = this.delayGameStart(gameData);
          if (isDelayedEnough) {
            inGameData.status = GameStatus.Playing;
            this.eventRunner.emit('game:start', roomId);
          }
          break;
        }
        case GameStatus.Playing: {
          /** calculatePaddleDisplacement and add it to the position */
          const { dBlue, dRed } = calculatePaddleDisplacement(gameData);
          inGameData.paddleBlue.position.y += dBlue;
          inGameData.paddleRed.position.y += dRed;
          /* calculateBallDisplacement and add it to the position */
          const { dx, dy } = calculateBallDisplacement(gameData);
          inGameData.ball.position.x += dx;
          inGameData.ball.position.y += dy;
          if (inGameData.frame % 120 === 0) { this.logger.debug('log every 2second, game:render', inGameData.renderData); }
          this.eventRunner.emit('game:render', roomId, inGameData.renderData);

          /** check wall bound */
          const wallCollision = checkWallBound(gameData);
          if (wallCollision) inGameData.ball.velocity.y *= (-1);
          // check paddle bound
          const paddleBound = checkPaddleBound(gameData);
          if (paddleBound) inGameData.ball.velocity.x *= (-1);
          /* check end of Round and return winner of the round */
          const roundResult: RoundResult = checkEndOfRound(gameData);
          if (roundResult === RoundResult.playing) break;
          if (roundResult === RoundResult.blueWin) inGameData.scoreBlue += 1;
          if (roundResult === RoundResult.redWin) inGameData.scoreRed += 1;
          this.eventRunner.emit('game:score', roomId, inGameData.scoreData);

          /** reset object to default position */
          this.resetBallAndPaddle(gameData);
          /** check end of Game and wiiner of the game */
          const gameResult: GameResult = checkEndOfGame(gameData);
          if (gameResult === GameResult.playing) break;
          if (gameResult === GameResult.redWin) inGameData.winnerSeq = metaData.playerRed.userId;
          if (gameResult === GameResult.blueWin) inGameData.winnerSeq = metaData.playerBlue.userId;
          inGameData.status = GameStatus.End;
          break;
        }
        case GameStatus.End: {
          this.eventRunner.emit('game:end', roomId, {
            metaData,
            inGameData,
          });
          break;
        }
        default: {
          this.logger.error(`unknown status: ${inGameData.status}`);
          // TODO: handling error
          break;
        }
      }
    });
  }

  /**
 * 한쪽이 승리하게 되면, 공과 패들의 위치를 초기화 시킨다.
 * @param game game data
 */
  resetBallAndPaddle(game: GameData) {
    this.logger.debug('resetBallAndPaddle');
    const { inGameData: { ball, paddleBlue, paddleRed } } = game;

    paddleBlue.position.y = 0;
    paddleRed.position.x = 0;
    ball.position.x = 0;
    ball.position.y = 0;
    ball.velocity.x = 0; // TODO(jinbekim): apply rand
    ball.velocity.y = 1; // TODO(jinbekim): apply rand
  }

  /**
 * 게임이 시작되기 전에 준비할 시간을 주기 위해
 * 일정 시간동안 딜레이(지연)시간을 준다.
 * @param roomId 방 아이디
 * @param gameData
 * @returns 게임 시작 여부.
 */
  delayGameStart(
    gameData: GameData,
  ): boolean {
    const { inGameData } = gameData;
    if (inGameData.frame > 800) return true;
    return false;
  }

  /**
   * 시뮬레이션 큐에 해당 게임을 등록한다.
   * @param game 등록할 게임 데이터
   */
  async initBeforeStartGame(game: GameData) {
    this.logger.debug(`startGame: ${game.metaData}`);
    /* add game in simulation game queue */
    this.games.set(game.metaData.roomId, game);

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
  async initAfterEndGame(roomId: string) {
    this.logger.debug('initAfterEndGame', roomId);
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
