import { GameDataDto } from '../dto/game-data.dto';

/**
 * 벽과 충돌을 판단해서 return 한다.
 * @param game game data
 * @return boolean
 */
export const checkWallBound = (game: GameDataDto): boolean => {
  const { inGameData: { ball } } = game;
  const BALL = GameDataDto.spec.ball;
  const HALF_OF_ARENA_HEIGHT = GameDataDto.spec.arena.height / 2;

  if (ball.position.y + BALL.radius > HALF_OF_ARENA_HEIGHT
    && ball.position.y - BALL.radius < (-1) * HALF_OF_ARENA_HEIGHT) {
    return true;
  }
  return false;
};
