import { GameData } from '../dto/game-data';

/**
* 시뮬레이션 큐에 해당 게임을 등록한다.
* @param game 등록할 게임 데이터
*/
export const initBeforeStartGame = async function startGame(game: GameData) {
  this.logger.debug(`startGame: ${game.metaData}`);
  this.games.set(game.metaData.roomId, game);
  // const inGame = this.gameRepository.create({
  //   roomId: game.metaData.roomId,
  //   topUserName: game.metaData.playerTop.userId,
  //   btmUserName: game.metaData.playerBtm.userId,
  //   topUserSeq: game.metaData.playerTop.userId,
  //   btmUserSeq: game.metaData.playerBtm.userId,
  // });
  // // 실제 게임 실행과는 별개여서 await해줄 필요 없을듯.
  // try {
  //   const ret = await this.gameRepository.save(inGame);
  //   // eslint-disable-next-line no-param-reassign
  //   game.metaData.gameSeq = ret.gameSeq; // NOTE: 추후에 게임로그 저장시 사용할 게임 시퀀스.
  // } catch (err) {
  //   this.logger.error(err);
  // }
};
