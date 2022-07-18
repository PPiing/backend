import { GameData } from '../dto/game-data';

/**
 * checkEndOfGame 의 return type
 */
export const enum GameResult {
  blueWin = 'blueWin',
  redWin = 'redWin',
  playing = 'playing',
}

/**
 * 매치스코어와 현재 점수를 비교해서 게임이 종료 되는지 판단한다.
 * @param game game data
 * @returns game result
 */
export const checkEndOfGame = (game: GameData) : GameResult => {
  const { ruleData: { matchScore }, inGameData: { scoreBlue, scoreRed } } = game;

  if (matchScore === scoreBlue) return GameResult.blueWin;
  if (matchScore === scoreRed) return GameResult.redWin;
  return GameResult.playing;
};
