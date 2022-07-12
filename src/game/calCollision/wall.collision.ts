import { GameData } from '../dto/game-data';

/**
 * 벽과 충돌을 판단해서 충돌 했을 경우 방향을 바꿔준다.
 * @param game game data
 */
export const checkWallCollision = (game: GameData) => {
  const { inGameData } = game;
  const { ball } = inGameData;
  if (ball.position.x - GameData.spec.ball.radius < 0) {
    ball.position.x = GameData.spec.ball.radius;
    ball.velocity.x *= -1;
  } else if (ball.position.x + GameData.spec.ball.radius > GameData.spec.arena.width) {
    ball.position.x = GameData.spec.arena.width - GameData.spec.ball.radius;
    ball.velocity.x *= -1;
  }
};
