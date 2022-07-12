import { InGameData } from '../dto/in-game.dto';

/**
 * 게임이 시작되기 전에 준비할 시간을 주기 위해
 * 일정 시간동안 딜레이(지연)시간을 준다.
 * @param roomId 방 아이디
 * @param inGameData
 * @returns 게임 시작 전 상태
 */
export const countReadyAndStart = function delay(
  roomId: string,
  inGameData: InGameData,
): boolean {
  if (inGameData.frame === 1) {
    this.eventRunner.emit('game:start', roomId, {
      status: 'ready',
    });
  } else if (inGameData.frame === 1200) {
    this.eventRunner.emit('game:start', roomId, {
      status: 'start',
    });
  } else if (inGameData.frame > 1200) {
    return true;
  }
  return false;
};
