import { IsNotEmpty } from 'class-validator';
import GameType from 'src/enums/mastercode/game-type.enum';

export class QueueDto {
  @IsNotEmpty()
    isLadder: GameType;
}
