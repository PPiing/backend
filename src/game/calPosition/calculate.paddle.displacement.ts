import { GameData } from '../dto/game-data';

export type PaddleDisplacement = {
  dBlue: number;
  dRed: number;
};

/**
 * 매 프레임 마다 패들의 위치를 계산해 반환한다.
 * @param game game data
 */
export const calculatePaddleDisplacement = (game: GameData) => {
  const PADDLE = GameData.spec.paddle;
  const ARENA = GameData.spec.arena;
  const { ruleData, inGameData: { paddleBlue, paddleRed } } = game;
  const halfPaddleHeight = ruleData.paddleSize * (PADDLE.height / 2);
  let dBlue = paddleBlue.velocity.y * PADDLE.speed;
  let dRed = paddleRed.velocity.y * PADDLE.speed;

  const finalBlueTop = paddleBlue.position.y - halfPaddleHeight + dBlue;
  const finalBlueBtm = paddleBlue.position.y + halfPaddleHeight + dBlue;
  if (finalBlueTop < (ARENA.height / 2) * -1) dBlue -= finalBlueTop - ((ARENA.height / 2) * -1);
  if (finalBlueBtm > (ARENA.height / 2)) dBlue -= finalBlueBtm - (ARENA.height / 2);

  const finalRedTop = paddleRed.position.y - halfPaddleHeight + dRed;
  const finalRedBtm = paddleRed.position.y + halfPaddleHeight + dRed;
  if (finalRedTop < (ARENA.height / 2) * -1) dRed -= finalRedTop - ((ARENA.height / 2) * -1);
  if (finalRedBtm > (ARENA.height / 2)) dRed -= finalRedBtm - (ARENA.height / 2);

  return {
    dBlue, dRed,
  };
};

// 순수함수로 만들어 볼까?
