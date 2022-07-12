import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';

/**
 * 각 데이터들의 타입을 front랑 맞춰야 할듯.
 * 아마 마스터코드 빼고 number 나 boolean 타입으로 바꿀듯.
 * TODO: naming 센스있게 바꿔야 할듯.
 */
export type DequeueDto = QueueDto;
export class QueueDto {
  score: GameOption;

  speed: GameOption;

  size: GameOption;

  isRankGame: GameType;
}
