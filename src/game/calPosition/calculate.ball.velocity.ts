import { PaddleBoundType } from '../checkBound/check.paddle.bound';
import { GameData } from '../dto/game-data';

interface VelocityType {
  velocityX: number;
  velocityY: number;
}

export function calculateBallVelocity(game: GameData, paddleBound: PaddleBoundType): VelocityType {
  const { inGameData: { ball, paddleBlue, paddleRed }, ruleData: { ballSpeed } } = game;
  const HALF_OF_PADDLE_HEIGHT = GameData.spec.paddle.height / 2;
  const BALL = GameData.spec.ball;

  const ret: VelocityType = {
    velocityX: ball.velocity.x,
    velocityY: ball.velocity.y,
  };

  const paddle = paddleBound === 'blue' ? paddleBlue : paddleRed;
  const direction = paddleBound === 'blue' ? 1 : -1;

  const collidePoint = (ball.position.y - paddle.position.y) / HALF_OF_PADDLE_HEIGHT;
  const angleRad = collidePoint * (Math.PI / 4);

  ret.velocityX = direction * BALL.speed * ballSpeed * Math.cos(angleRad);
  ret.velocityY = BALL.speed * ballSpeed * Math.sin(angleRad);
  return ret;
}
