import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import GameOption from 'src/enums/mastercode/game-option.enum';
import { GameData } from './dto/game-data';
import { GameStatus, InGameData, PaddleDirective } from './dto/in-game.dto';
import { GameLogRepository } from './game-log.repository';

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
      this.logger.debug(`frame: ${inGameData.frame}`);
      switch (inGameData.status) {
        case GameStatus.Ready: {
          const started = this.countReadyAndStart(roomId, inGameData);
          if (started) inGameData.status = GameStatus.Playing;
          break;
        }
        case GameStatus.Playing: {
          // plus vector to position.
          this.movePaddle(data);
          this.moveBall(data);
          this.eventRunner.emit('game:render', roomId, data.inGameData.renderData);
          // check wall bound
          this.checkWallCollision(data);
          // check paddle bound
          this.checkPaddleCollision(data);
          // check goal
          const checker = this.checkScorePosition(data);
          if (checker) {
            this.resetBallAndPaddle(data);
            this.eventRunner.emit('game:score', roomId, data.inGameData.score);
            let matchScore: number;

            if (GameOption.GLOP40 === ruleData.option3) matchScore = 5;
            else if (GameOption.GLOP41 === ruleData.option3) matchScore = 3;
            else if (GameOption.GLOP42 === ruleData.option3) matchScore = 1;
            else this.logger.error('invalid option3');

            if (matchScore === inGameData.score.scoreBtm) {
              inGameData.status = GameStatus.End;
              inGameData.winner = metaData.playerBtm.userId;
            } else if (matchScore === inGameData.score.scoreTop) {
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
          break;
        }
      }
    });
  }

  private resetBallAndPaddle(game: GameData) {
    this.logger.debug('resetBallAndPaddle');
    const { inGameData } = game;
    const { ball, paddleTop, paddleBtm } = inGameData;
    ball.position.x = GameData.spec.arena.width / 2;
    ball.position.y = GameData.spec.arena.height / 2;
    paddleTop.position.x = GameData.spec.arena.width / 2;
    paddleBtm.position.x = GameData.spec.arena.width / 2;
    ball.velocity.x = 0;
    ball.velocity.y = 1; // TODO: random 1 or -1
  }

  private checkScorePosition(game: GameData) {
    const { inGameData } = game;
    const { ball } = inGameData;

    if (ball.position.y - GameData.spec.ball.radius < 0) {
      inGameData.scoreTop += 1;
      return 1;
    } if (ball.position.y + GameData.spec.ball.radius > GameData.spec.arena.height) {
      inGameData.scoreBtm += 1;
      return 2;
    }
    return false;
  }

  private checkPaddleCollision(game: GameData) {
    const { inGameData, ruleData } = game; // TODO: ruleData 적용.
    const { ball, paddleTop, paddleBtm } = inGameData;
    const BALL = ball.position;
    const SPEC = GameData.spec;
    if (
      BALL.x < paddleTop.position.x + SPEC.paddle.width / 2
      && BALL.x > paddleTop.position.x - SPEC.paddle.width / 2
      && BALL.y - SPEC.ball.radius < paddleTop.position.y + SPEC.paddle.height / 2
      && BALL.y + SPEC.ball.radius > paddleTop.position.y - SPEC.paddle.height / 2
    ) {
      ball.velocity.y *= -1;
      BALL.y = paddleTop.position.y + SPEC.ball.radius + SPEC.paddle.height / 2;
    } else if (
      BALL.x - SPEC.ball.radius < paddleBtm.position.x + SPEC.paddle.width
      && BALL.x + SPEC.ball.radius > paddleBtm.position.x
      && BALL.y + SPEC.ball.radius > paddleBtm.position.y
      && BALL.y - SPEC.ball.radius < paddleBtm.position.y + SPEC.paddle.height
    ) {
      ball.velocity.y *= -1;
      BALL.y = paddleBtm.position.y - SPEC.ball.radius - SPEC.paddle.height / 2;
    }
  }

  private checkWallCollision(game: GameData) {
    const { inGameData } = game;
    const { ball } = inGameData;
    if (ball.position.x - GameData.spec.ball.radius < 0) {
      ball.position.x = GameData.spec.ball.radius;
      ball.velocity.x *= -1;
    } else if (ball.position.x + GameData.spec.ball.radius > GameData.spec.arena.width) {
      ball.position.x = GameData.spec.arena.width - GameData.spec.ball.radius;
      ball.velocity.x *= -1;
    }
  }

  private moveBall(game: GameData) {
    const { inGameData, ruleData } = game; // TODO: ruleData 적용.
    const { ball } = inGameData;
    ball.position.x += ball.velocity.x * GameData.spec.ball.speed;
    ball.position.y += ball.velocity.y * GameData.spec.ball.speed;
  }

  private movePaddle(game: GameData) {
    const { inGameData, ruleData } = game; // TODO: ruleData 적용.
    const { paddleTop, paddleBtm } = inGameData;
    paddleTop.position.x += paddleTop.velocity.x * GameData.spec.paddle.speed;
    paddleBtm.position.x += paddleBtm.velocity.x * GameData.spec.paddle.speed;
    if (paddleBtm.position.x - GameData.spec.paddle.width < 0) {
      paddleBtm.position.x = GameData.spec.paddle.width / 2;
    }
    if (paddleBtm.position.x + GameData.spec.paddle.width > GameData.spec.arena.width) {
      paddleBtm.position.x = GameData.spec.arena.width - GameData.spec.paddle.width / 2;
    }
    if (paddleTop.position.x - GameData.spec.paddle.width < 0) {
      paddleTop.position.x = GameData.spec.paddle.width / 2;
    }
    if (paddleTop.position.x + GameData.spec.paddle.width > GameData.spec.arena.width) {
      paddleTop.position.x = GameData.spec.arena.width - GameData.spec.paddle.width / 2;
    }
  }

  private countReadyAndStart(roomId: string, inGameData: InGameData): boolean {
    if (inGameData.frame === 1) {
      this.eventRunner.emit('game:start', roomId, {
        status: 'ready',
      });
    } else if (inGameData.frame === 1200) {
      this.eventRunner.emit('game:start', roomId, {
        status: 'start',
      });
    } else if (inGameData.frame > 1200) {
      return true;
    }
    return false;
  }

  /**
   * 시뮬레이션 큐에 해당 게임을 등록한다.
   * @param game 등록할 게임 데이터
   */
  async startGame(game: GameData) {
    this.logger.debug(`startGame: ${game.metaData}`);
    this.games.set(game.metaData.roomId, game);
    // const inGame = this.gameRepository.create({
    //   roomId: game.metaData.roomId,
    //   topUserName: game.metaData.playerTop.userId,
    //   btmUserName: game.metaData.playerBtm.userId,
    //   topUserSeq: game.metaData.playerTop.userId,
    //   btmUserSeq: game.metaData.playerBtm.userId,
    // });
    // // 실제 게임 실행과는 별개여서 await해줄 필요 없을듯.
    // try {
    //   const ret = await this.gameRepository.save(inGame);
    //   // eslint-disable-next-line no-param-reassign
    //   game.metaData.gameSeq = ret.gameSeq; // NOTE: 추후에 게임로그 저장시 사용할 게임 시퀀스.
    // } catch (err) {
    //   this.logger.error(err);
    // }
  }

  /**
   * 게임 종료 후에 게임을 삭제한다.
   * @param roomId 방 아이디
   */
  endGame(roomId: string) {
    const game = this.games.get(roomId);
    if (game && game.inGameData.status === GameStatus.End) {
      const gameLog = this.gameLogRepository.create({
        gameType: game.metaData.gameType,
        topSideScore: game.inGameData.scoreTop,
        btmSideScore: game.inGameData.scoreBtm,
        winnerSeq: game.inGameData.winner,
        option1: game.ruleData.option1,
        option2: game.ruleData.option2,
        option3: game.ruleData.option3,
      });
      this.gameLogRepository.save(gameLog);
      this.games.delete(roomId);
    }
  }

  /**
   * 해당 유저의 패들의 방향을 변경한다.
   * @param roomId 방 아이디
   * @param userId 방향을 바꿀 유저 아이디
   * @param direction 패들의 방향
   * @returns void
   */
  handlePaddle(roomId:string, userId: number, direction: PaddleDirective) {
    const game = this.games.get(roomId);
    if (!game) return;
    if (game.metaData.playerTop.userId === userId) {
      game.inGameData.paddleTop.velocity.x = direction;
    }
    if (game.metaData.playerBtm.userId === userId) {
      game.inGameData.paddleBtm.velocity.x = direction;
    }
  }
}
