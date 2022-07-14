import { GameData } from '../dto/game-data';

export const enum ScorePosition {
  blueWin = 'blueWin',
  redWin = 'redWin',
  playing = 'playing',
}
/**
 * 매 프레임 마다 공의 위치가 승리조건에 부합하는지 판단한다.
 * @param game game data
 * @returns win or lose
 */
export const checkScorePosition = (game: GameData) : ScorePosition => {
  const { inGameData: { ball } } = game;
  const BALL = GameData.spec.ball;
  const ARENA = GameData.spec.arena;

  // left(blue) lose
  if (ball.position.x - BALL.radius < ((ARENA.width / 2) * -1)) {
    return ScorePosition.redWin;
  }
  // rigth(red) lose
  if (ball.position.x + BALL.radius > (ARENA.width / 2)) {
    return ScorePosition.blueWin;
  }
  return ScorePosition.playing;
};

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
