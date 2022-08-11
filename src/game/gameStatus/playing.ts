import { calculateBallDisplacement } from '../calPosition/calculate.ball.displacement';
import { calculatePaddleDisplacement } from '../calPosition/calculate.paddle.displacement';
import { checkPaddleBound } from '../checkBound/check.paddle.bound';
import { checkWallBound } from '../checkBound/check.wall.bound';
import { checkEndOfRound, RoundResult } from '../checkStatus/check.end-of-round';
import { GameData } from '../dto/game-data';

export default function handlePlaying(gameData: GameData) {
  const { inGameData } = gameData;

  /** calculatePaddleDisplacement and add it to the position */
  const { dBlue, dRed } = calculatePaddleDisplacement(gameData);
  inGameData.paddleBlue.position.y += dBlue;
  inGameData.paddleRed.position.y += dRed;

  /* calculateBallDisplacement and add it to the position */
  const { dx, dy } = calculateBallDisplacement(gameData);
  inGameData.ball.position.x += dx;
  inGameData.ball.position.y += dy;

  /** check wall bound */
  const wallBound = checkWallBound(gameData);
  if (wallBound) inGameData.ball.velocity.y *= (-1);
  // check paddle bound
  const paddleBound = checkPaddleBound(gameData);
  if (paddleBound) inGameData.ball.velocity.x *= (-1);
  /* check end of Round and return winner of the round */
  const roundResult: RoundResult = checkEndOfRound(gameData);

  return roundResult;
}
