import { GameData } from '../dto/game-data';

/**
 * 매 프레임 마다 공의 위치가 승리조건에 부합하는지 판단한다.
 * @param game game data
 * @returns win or lose
 */
export const checkScorePosition = (game: GameData) => {
  const { inGameData } = game;
  const { ball } = inGameData;

  // left(blue) lose
  if (ball.position.x - GameData.spec.ball.radius < ((GameData.spec.arena.width / 2) * -1)) {
    inGameData.scoreBlue += 1;
    return 1;
  }
  // rigth(red) lose
  if (ball.position.x + GameData.spec.ball.radius > (GameData.spec.arena.width / 2)) {
    inGameData.scoreRed += 1;
    return 2;
  }
  return false;
};
