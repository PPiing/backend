import { GameData } from '../dto/game-data';

/**
 * 게임이 시작되기 전에 준비할 시간을 주기 위해
 * 일정 시간동안 딜레이(지연)시간을 준다.
 * @param roomId 방 아이디
 * @param gameData
 * @returns 게임 시작 여부.
 */
export default function readyToStart(gameData: GameData) {
  const { inGameData: { frame } } = gameData;
  if (frame > 500) return true;
  return false;
}
