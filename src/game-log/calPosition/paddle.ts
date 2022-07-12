import { GameData } from '../dto/game-data';

/**
 * 매 프레임 마다 패들의 위치를 계산해 이동시킨다.
 * @param game game data
 */
export const movePaddle = (game: GameData) => {
  const { inGameData, ruleData } = game; // TODO: ruleData 적용.
  const { paddleBlue, paddleRed } = inGameData;
  paddleBlue.position.x += paddleBlue.velocity.x * GameData.spec.paddle.speed;
  paddleRed.position.x += paddleRed.velocity.x * GameData.spec.paddle.speed;
  if (paddleRed.position.x - GameData.spec.paddle.width < 0) {
    paddleRed.position.x = GameData.spec.paddle.width / 2;
  }
  if (paddleRed.position.x + GameData.spec.paddle.width > GameData.spec.arena.width) {
    paddleRed.position.x = GameData.spec.arena.width - GameData.spec.paddle.width / 2;
  }
  if (paddleBlue.position.x - GameData.spec.paddle.width < 0) {
    paddleBlue.position.x = GameData.spec.paddle.width / 2;
  }
  if (paddleBlue.position.x + GameData.spec.paddle.width > GameData.spec.arena.width) {
    paddleBlue.position.x = GameData.spec.arena.width - GameData.spec.paddle.width / 2;
  }
};

// 순수함수로 만들어 볼까?
