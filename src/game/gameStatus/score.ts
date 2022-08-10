import { checkEndOfGame, GameResult } from '../checkStatus/check.end-of-game';
import { GameData } from '../dto/game-data';
import { GameStatus } from '../dto/in-game.dto';

/**
 * 한쪽이 승리하게 되면, 공과 패들의 위치를 초기화 시킨다.
 * @param game game data
 */
function resetBallAndPaddle(game: GameData) {
  const { inGameData: { ball, paddleBlue, paddleRed } } = game;

  paddleBlue.position.y = 0;
  paddleRed.position.y = 0;
  ball.position.x = 0;
  ball.position.y = 0;
  ball.velocity.x = 1; // TODO(jinbekim): apply rand
  ball.velocity.y = 0; // TODO(jinbekim): apply rand
}

export default function handleScore(gameData: GameData) {
  const { inGameData, inGameData: { status } } = gameData;
  if (status === GameStatus.ScoreBlue) inGameData.scoreBlue += 1;
  if (status === GameStatus.ScoreRed) inGameData.scoreRed += 1;
  resetBallAndPaddle(gameData);
  const gameResult: GameResult = checkEndOfGame(gameData);
  return gameResult;
}
