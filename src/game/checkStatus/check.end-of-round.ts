import { GameDataDto } from '../dto/game-data.dto';

export const enum RoundResult {
  blueWin = 'blueWin',
  redWin = 'redWin',
  playing = 'playing',
}
/**
 * 매 프레임 마다 공의 위치가 승리조건에 부합하는지 판단한다.
 * @param game game data
 * @returns win or lose
 */
export const checkEndOfRound = (game: GameDataDto) : RoundResult => {
  const { inGameData: { ball } } = game;
  const BALL = GameDataDto.spec.ball;
  const ARENA = GameDataDto.spec.arena;

  // left(blue) lose
  if (ball.position.x - BALL.radius < ((ARENA.width / 2) * -1)) {
    return RoundResult.redWin;
  }
  // rigth(red) lose
  if (ball.position.x + BALL.radius > (ARENA.width / 2)) {
    return RoundResult.blueWin;
  }
  return RoundResult.playing;
};
