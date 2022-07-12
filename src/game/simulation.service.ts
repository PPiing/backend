import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import GameOption from 'src/enums/mastercode/game-option.enum';
import { GameData } from './dto/game-data';
import { GameStatus } from './dto/in-game.dto';
import { initAfterEndGame } from './initializeGame/end';
import { handlePaddle } from './handler/paddle';
import { GameLogRepository } from './repository/game-log.repository';
import { initBeforeStartGame } from './initializeGame/start';
import { countReadyAndStart } from './initializeGame/ready';
import { movePaddle } from './calPosition/paddle';
import { calculateBallDisplacement } from './calPosition/ball';
import { checkWallCollision } from './calCollision/wall.collision';
import { checkPaddleCollision } from './calCollision/paddle.collision';
import { checkScorePosition, ScorePosition } from './calPosition/score.position';
import { resetBallAndPaddle } from './initializeGame/reset';

@Injectable()
export class SimulationService {
  private readonly logger: Logger = new Logger('SimulationService');

  private games: Map<string, GameData> = new Map();

  constructor(
    private readonly eventRunner: EventEmitter2,
    private readonly gameLogRepository: GameLogRepository,
  ) {}

  /**
   * 일정 인터벌 마다 게임을 실행하고 결과를 반환한다.
   */
  @Interval(17) // TODO: games가 변경되면 이벤트를 발생시킨다.로 수정. 아니면 다이나믹 모듈로 변경해도 될듯.
  handleGames() {
    this.games.forEach((data, roomId) => {
      const { inGameData, metaData, ruleData } = data;
      inGameData.frame += 1;
      switch (inGameData.status) {
        case GameStatus.Ready: {
          const started = this.countReadyAndStart(roomId, inGameData);
          if (started) inGameData.status = GameStatus.Playing;
          break;
        }
        case GameStatus.Playing: {
          // plus vector to position.
          this.movePaddle(data);

          /* calculateBallDisplacement and add it to the position */
          const { dx, dy } = calculateBallDisplacement(data);
          inGameData.ball.position.x += dx;
          inGameData.ball.position.y += dy;

          this.eventRunner.emit('game:render', roomId, data.inGameData.renderData);
          // check wall bound
          this.checkWallCollision(data);
          // check paddle bound
          this.checkPaddleCollision(data);
          /* checking scoring player */
          const checker: ScorePosition = this.checkScorePosition(data);
          if (checker === ScorePosition.blueWin || checker === ScorePosition.redWin) {
            this.resetBallAndPaddle(data);
            this.eventRunner.emit('game:score', roomId, data.inGameData.scoreData);
            let matchScore: number;

            if (GameOption.GLOP40 === ruleData.option3) matchScore = 5;
            else if (GameOption.GLOP41 === ruleData.option3) matchScore = 3;
            else if (GameOption.GLOP42 === ruleData.option3) matchScore = 1;
            else this.logger.error('invalid option3');

            if (matchScore === inGameData.scoreData.red) {
              inGameData.status = GameStatus.End;
              inGameData.winner = metaData.playerBtm.userId;
            } else if (matchScore === inGameData.scoreData.blue) {
              inGameData.status = GameStatus.End;
              inGameData.winner = metaData.playerTop.userId;
            }
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
 * 매 프레임 마다 패들의 위치를 계산해 이동시킨다.
 * @param game game data
 */
  private movePaddle = movePaddle;

  /**
 * 게임이 시작되기 전에 준비할 시간을 주기 위해
 * 일정 시간동안 딜레이(지연)시간을 준다.
 * @param roomId 방 아이디
 * @param inGameData
 * @returns 게임 시작 전 상태
 */
  private countReadyAndStart = countReadyAndStart;

  /**
   * 시뮬레이션 큐에 해당 게임을 등록한다.
   * @param game 등록할 게임 데이터
   */
  startGame = initBeforeStartGame;

  /**
   * 게임 종료 후에 게임을 삭제한다.
   * @param roomId 방 아이디
   */
  endGame = initAfterEndGame;

  /**
   * 해당 유저의 패들의 방향을 변경한다.
   * @param roomId 방 아이디
   * @param userId 방향을 바꿀 유저 아이디
   * @param direction 패들의 방향
   * @returns void
   */
  handlePaddle = handlePaddle;
}
