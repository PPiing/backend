import { GameData } from '../dto/game-data';

export type BallDisplacement = {
  dx : number,
  dy : number
};

/**
 * 매 프레임 마다 공의 위치를 계산해 return 한다.
 * @param game game data
 * @return BallDisplacement
 */
export const calculateBallDisplacement = (game: GameData) : BallDisplacement => {
  const { inGameData: { ball }, ruleData: { ballSpeed } } = game;
  const BALL = GameData.spec.ball;
  const ARENA = GameData.spec.arena;
  const displacement = {
    dx: ball.velocity.x * BALL.speed * ballSpeed,
    dy: ball.velocity.y * BALL.speed * ballSpeed,
  };
  const calculatedPositionX = ball.position.x + displacement.dx;
  const calculatedPositionY = ball.position.y + displacement.dy;
  if (calculatedPositionX > (ARENA.width / 2)) {
    displacement.dx -= calculatedPositionX - (ARENA.width / 2);
  }
  if (calculatedPositionX < -(ARENA.width / 2)) {
    displacement.dx -= calculatedPositionX + (ARENA.width / 2);
  }
  if (calculatedPositionY > (ARENA.height / 2)) {
    displacement.dy -= calculatedPositionY - (ARENA.height / 2);
  }
  if (calculatedPositionY < -(ARENA.height / 2)) {
    displacement.dy -= calculatedPositionY + (ARENA.height / 2);
  }
  return displacement;
};
