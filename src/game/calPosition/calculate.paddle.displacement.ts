import { GameData } from '../dto/game-data';

export type PaddleDisplacement = {
  dBlue: number;
  dRed: number;
};

/**
 * 매 프레임 마다 패들의 위치를 계산해 반환한다.
 * @param game game data
 */
export const calculatePaddleDisplacement = (game: GameData): PaddleDisplacement => {
  const PADDLE = GameData.spec.paddle;
  const ARENA = GameData.spec.arena;
  const { ruleData, inGameData: { paddleBlue, paddleRed } } = game;
  const halfPaddleHeight = ruleData.paddleSize * (PADDLE.height / 2);
  const halfArenaHeight = ARENA.height / 2;
  const displacement = {
    dBlue: paddleBlue.velocity.y * PADDLE.speed,
    dRed: paddleRed.velocity.y * PADDLE.speed,
  };

  const finalBlueTop = paddleBlue.position.y - halfPaddleHeight + displacement.dBlue;
  const finalBlueBtm = paddleBlue.position.y + halfPaddleHeight + displacement.dBlue;
  if (finalBlueTop < -(halfArenaHeight)) {
    displacement.dBlue -= finalBlueTop - ((halfArenaHeight) * -1);
  }
  if (finalBlueBtm > (halfArenaHeight)) displacement.dBlue -= finalBlueBtm - (halfArenaHeight);

  const finalRedTop = paddleRed.position.y - halfPaddleHeight + displacement.dRed;
  const finalRedBtm = paddleRed.position.y + halfPaddleHeight + displacement.dRed;
  if (finalRedTop < -(halfArenaHeight)) {
    displacement.dRed -= finalRedTop - ((halfArenaHeight) * -1);
  }
  if (finalRedBtm > (halfArenaHeight)) displacement.dRed -= finalRedBtm - (halfArenaHeight);
  return displacement;
};

// 순수함수로 만들어 볼까?
