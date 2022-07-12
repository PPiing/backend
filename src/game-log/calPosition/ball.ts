import { GameData } from '../dto/game-data';

/**
 * 매 프레임 마다 공의 위치를 계산해 이동시킨다.
 * @param game game data
 */
export const moveBall = (game: GameData) => {
  const { inGameData } = game; // TODO(jinbe): ruleData 적용.
  const { ball } = inGameData;
  ball.position.x += ball.velocity.x * GameData.spec.ball.speed;
  ball.position.y += ball.velocity.y * GameData.spec.ball.speed;
};
