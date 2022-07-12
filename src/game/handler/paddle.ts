import { PaddleDirective } from '../dto/in-game.dto';

/**
* 해당 유저의 패들의 방향을 변경한다.
* @param roomId 방 아이디
* @param userId 방향을 바꿀 유저 아이디
* @param direction 패들의 방향
* @returns void
*/
export const handlePaddle = function handler(
  roomId:string,
  userId: number,
  direction: PaddleDirective,
) {
  const game = this.games.get(roomId);
  if (!game) return;
  if (game.metaData.playerTop.userId === userId) {
    game.inGameData.paddleBlue.velocity.x = direction;
  }
  if (game.metaData.playerBtm.userId === userId) {
    game.inGameData.paddleRed.velocity.x = direction;
  }
};
