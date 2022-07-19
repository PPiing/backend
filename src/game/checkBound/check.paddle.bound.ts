import { GameData } from '../dto/game-data';

/**
 * 패들과의 충돌을 판단한다.
 * @param game game data
 * @return boolean
 */
export const checkPaddleBound = (game: GameData): boolean => {
  const { inGameData: { ball, paddleBlue, paddleRed } } = game;
  const HALF_OF_PADDLE_HEIGHT = GameData.spec.paddle.height / 2;
  const HALF_OF_PADDLE_WIDTH = GameData.spec.paddle.width / 2;
  const BALL = GameData.spec.ball;

  /** Check bluePaddle collision */
  if (ball.position.x + BALL.radius < paddleBlue.position.x + HALF_OF_PADDLE_WIDTH
    && ball.position.x + BALL.radius > paddleBlue.position.x - HALF_OF_PADDLE_WIDTH
    && ball.position.y < paddleBlue.position.y + HALF_OF_PADDLE_HEIGHT
    && ball.position.y > paddleBlue.position.y - HALF_OF_PADDLE_HEIGHT) { return true; }
  /** Check bluePaddle collision */
  if (ball.position.x + BALL.radius < paddleRed.position.x + HALF_OF_PADDLE_WIDTH
    && ball.position.x + BALL.radius > paddleRed.position.x - HALF_OF_PADDLE_WIDTH
    && ball.position.y < paddleRed.position.y + HALF_OF_PADDLE_HEIGHT
    && ball.position.y > paddleRed.position.y - HALF_OF_PADDLE_HEIGHT) { return true; }

  return false;
};
