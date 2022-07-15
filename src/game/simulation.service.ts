import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { GameData } from './dto/game-data';
import { GameStatus, InGameData, PaddleDirective } from './dto/in-game.dto';
import { handlePaddle } from './handler/paddle';
import { GameLogRepository } from './repository/game-log.repository';
import { checkWallCollision } from './calCollision/wall.collision';
import { checkPaddleCollision } from './calCollision/paddle.collision';
import {
  checkEndOfGame, checkScorePosition, GameResult, ScorePosition,
} from './calPosition/score.position';
import { resetBallAndPaddle } from './initializeGame/reset';
import { calculateBallDisplacement } from './calPosition/calculate.ball.displacement';
import { GameSocket } from './dto/game-socket.dto';
import { RuleDto } from './dto/rule.dto';
import { calculatePaddleDisplacement } from './calPosition/calculate.paddle.displacement';

@Injectable()
export class SimulationService {
  private readonly logger: Logger = new Logger('Simula`tionService');

  private games: Map<string, GameData> = new Map();

  constructor(
    private readonly eventRunner: EventEmitter2,
    private readonly gameLogRepository: GameLogRepository,
  ) {}

  @Interval(17) // TODO: games가 변경되면 이벤트를 발생시킨다.로 수정. 아니면 다이나믹 모듈로 변경해도 될듯.
  handleGames() {
    this.games.forEach((gameData, roomId) => {
      const { inGameData, metaData } = gameData;
      inGameData.frame += 1;
      switch (inGameData.status) {
        case GameStatus.Ready: {
          const isDelayedEnough = this.delayGameStart(gameData);
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

          this.eventRunner.emit('game:render', roomId, inGameData.renderData);
          // check wall bound
          this.checkWallCollision(gameData);
          // check paddle bound
          this.checkPaddleCollision(gameData);
          /* checking scoring player */
          const checker: ScorePosition = this.checkScorePosition(gameData);
          if (checker === ScorePosition.blueWin) inGameData.scoreBlue += 1;
          if (checker === ScorePosition.redWin) inGameData.scoreRed += 1;
          this.eventRunner.emit('game:score', roomId, inGameData.scoreData);
          this.resetBallAndPaddle(gameData);

          const endOfGame: GameResult = checkEndOfGame(gameData);
          if (endOfGame === GameResult.redWin) {
            inGameData.status = GameStatus.End;
            inGameData.winnerSeq = metaData.playerRed.userId;
          } else if (endOfGame === GameResult.blueWin) {
            inGameData.status = GameStatus.End;
            inGameData.winnerSeq = metaData.playerBlue.userId;
          }
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
  private resetBallAndPaddle = resetBallAndPaddle;

  /**
 * 매 프레임 마다 공의 위치가 승리조건에 부합하는지 판단한다.
 * @param game game data
 * @returns win or lose
 */
  private checkScorePosition = checkScorePosition;

  /**
 * 패들과의 충돌을 판단해서 방향을 바꿔준다.
 * @param game game data
 */
  private checkPaddleCollision = checkPaddleCollision;

  /**
 * 벽과 충돌을 판단해서 충돌 했을 경우 방향을 바꿔준다.
 * @param game game data
 */
  private checkWallCollision = checkWallCollision;

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
  initBeforeStartGame(game: GameData) {
    this.logger.debug(`startGame: ${game.metaData}`);
    /* add game in simulation game queue */
    this.games.set(game.metaData.roomId, game);

  /** TODO(jinbekim): save initial GameLog entity to repository */
  }

  initBeforeStartTestGame(client: GameSocket) {
    this.logger.debug('startGame:');
    /* add game in simulation game queue */
    const tmp = new GameData();
    tmp.inGameData = new InGameData();
    tmp.ruleData = new RuleDto();
    tmp.metaData = null;
    this.games.set(client.id, tmp);
  }

  /**
  * 게임 종료 후에 게임을 삭제한다.
  * @param roomId 방 아이디
  */
  initAfterEndGame(roomId: string) {
    const game = this.games.get(roomId);
    const { metaData, inGameData, ruleData } = game;
    if (game && game.inGameData.status === GameStatus.End) {
      const finishedGameLog = this.gameLogRepository.create({
        roomId: metaData.roomId,
        isRankGame: ruleData.isRankGame,
        blueUserSeq: metaData.playerBlue.userId,
        redUserSeq: metaData.playerRed.userId,
        blueUserName: metaData.playerBlue.userName,
        redUserName: metaData.playerRed.userName,
        winnerSeq: inGameData.winnerSeq,
        blueScore: inGameData.scoreBlue,
        redScore: inGameData.scoreRed,
        paddleSize: ruleData.paddleSize,
        ballSpeed: ruleData.ballSpeed,
        matchScore: ruleData.matchScore,
      });
      this.gameLogRepository.save(finishedGameLog);
      this.games.delete(roomId);
    }
  }

  /**
   * 해당 유저의 패들의 방향을 변경한다.
   * @param roomId 방 아이디
   * @param userId 방향을 바꿀 유저 아이디
   * @param direction 패들의 방향
   * @returns void
   * tmp
   */
  handlePaddle = handlePaddle;

  handleTestPaddle(
    roomId: string,
    userId: string,
    direction: PaddleDirective,
  ) {
    const game = this.games.get(roomId);
    const { metaData, inGameData } = game;
    if (!game) return;
    if (metaData.playerBlue.userId.toString() === userId) {
      inGameData.paddleBlue.velocity.x = direction;
    }
    if (metaData.playerRed.userId.toString() === userId) {
      inGameData.paddleRed.velocity.x = direction;
    }
  }
}
