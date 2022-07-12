import { GameData } from '../dto/game-data';

/**
 * 패들과의 충돌을 판단해서 방향을 바꿔준다.
 * @param game game data
 */
export const checkPaddleCollision = (game: GameData) => {
  const { inGameData, ruleData } = game; // TODO: ruleData 적용.
  const { ball, paddleBlue, paddleRed } = inGameData;
  const BALL = ball.position;
  const SPEC = GameData.spec;
  if (
    BALL.x < paddleBlue.position.x + SPEC.paddle.width / 2
    && BALL.x > paddleBlue.position.x - SPEC.paddle.width / 2
    && BALL.y - SPEC.ball.radius < paddleBlue.position.y + SPEC.paddle.height / 2
    && BALL.y + SPEC.ball.radius > paddleBlue.position.y - SPEC.paddle.height / 2
  ) {
    ball.velocity.y *= -1;
    BALL.y = paddleBlue.position.y + SPEC.ball.radius + SPEC.paddle.height / 2;
  } else if (
    BALL.x - SPEC.ball.radius < paddleRed.position.x + SPEC.paddle.width
    && BALL.x + SPEC.ball.radius > paddleRed.position.x
    && BALL.y + SPEC.ball.radius > paddleRed.position.y
    && BALL.y - SPEC.ball.radius < paddleRed.position.y + SPEC.paddle.height
  ) {
    ball.velocity.y *= -1;
    BALL.y = paddleRed.position.y - SPEC.ball.radius - SPEC.paddle.height / 2;
  }
};
