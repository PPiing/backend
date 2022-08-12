import { GameData } from '../dto/game-data';

export type PaddleBoundType = 'red' | 'blue' | 'none';

/**
 * 패들과의 충돌을 판단한다.
 * @param game game data
 * @return boolean
 */
export const checkPaddleBound = (game: GameData): PaddleBoundType => {
  const { inGameData: { ball, paddleBlue, paddleRed }, ruleData: { paddleSize } } = game;
  const HALF_OF_PADDLE_HEIGHT = (GameData.spec.paddle.height / 2) * paddleSize;
  const HALF_OF_PADDLE_WIDTH = GameData.spec.paddle.width / 2;
  const BALL = GameData.spec.ball;
  const ballRight = ball.position.x + BALL.radius;
  const ballLeft = ball.position.x - BALL.radius;
  const bluePaddleRight = paddleBlue.position.x + HALF_OF_PADDLE_WIDTH;
  const redPaddleLeft = paddleRed.position.x - HALF_OF_PADDLE_WIDTH;

  /** Check bluePaddle collision */
  if (ballLeft < bluePaddleRight
    && ballLeft > paddleBlue.position.x - HALF_OF_PADDLE_WIDTH
    && ball.position.y < paddleBlue.position.y + HALF_OF_PADDLE_HEIGHT
    && ball.position.y > paddleBlue.position.y - HALF_OF_PADDLE_HEIGHT) { return 'blue'; }
  /** Check redPaddle collision */
  if (ballRight < paddleRed.position.x + HALF_OF_PADDLE_WIDTH
    && ballRight > redPaddleLeft
    && ball.position.y < paddleRed.position.y + HALF_OF_PADDLE_HEIGHT
    && ball.position.y > paddleRed.position.y - HALF_OF_PADDLE_HEIGHT) { return 'red'; }

  return 'none';
};
