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

  return {
    dx: ball.velocity.x * BALL.speed * ballSpeed,
    dy: ball.velocity.y * BALL.speed * ballSpeed,
  };
};
