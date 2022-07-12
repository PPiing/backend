import { GameStatus } from '../dto/in-game.dto';

/**
* 게임 종료 후에 게임을 삭제한다.
* @param roomId 방 아이디
*/
export const initAfterEndGame = function endGame(roomId: string) {
  const game = this.games.get(roomId);
  if (game && game.inGameData.status === GameStatus.End) {
    const gameLog = this.gameLogRepository.create({
      gameType: game.metaData.gameType,
      topSideScore: game.inGameData.scoreBlue,
      btmSideScore: game.inGameData.scoreRed,
      winnerSeq: game.inGameData.winner,
      option1: game.ruleData.option1,
      option2: game.ruleData.option2,
      option3: game.ruleData.option3,
    });
    this.gameLogRepository.save(gameLog);
    this.games.delete(roomId);
  }
};
