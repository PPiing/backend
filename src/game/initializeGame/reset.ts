import { GameData } from '../dto/game-data';

/**
 * 한쪽이 승리하게 되면, 공과 패들의 위치를 초기화 시킨다.
 * @param game game data
 */
export const resetBallAndPaddle = function reset(game: GameData) {
  this.logger.debug('resetBallAndPaddle');
  const { inGameData } = game;
  const { ball, paddleBlue, paddleRed } = inGameData;
  ball.position.x = GameData.spec.arena.width / 2;
  ball.position.y = GameData.spec.arena.height / 2;
  paddleBlue.position.x = GameData.spec.arena.width / 2;
  paddleRed.position.x = GameData.spec.arena.width / 2;
  ball.velocity.x = 0;
  ball.velocity.y = 1; // TODO(jinbe): random 1 or -1
};
